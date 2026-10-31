import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const searchParams = new URL(request.url).searchParams;
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const query = searchParams.get('q')?.trim().slice(0, 100) || '';
    const where = query ? { OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { content: { contains: query, mode: 'insensitive' as const } },
      { category: { contains: query, mode: 'insensitive' as const } },
      { location: { contains: query, mode: 'insensitive' as const } },
      { author: { name: { contains: query, mode: 'insensitive' as const } } },
      { author: { artisan: { profession: { contains: query, mode: 'insensitive' as const } } } },
    ] } : undefined;
    const posts = await db.socialPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            id: true, name: true, image: true, avatar: true, location: true,
            artisan: { select: { id: true, profession: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 3,
          include: { author: { select: { id: true, name: true, image: true, avatar: true } } },
        },
        reactions: { select: { userId: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    });

    return NextResponse.json({ posts: posts.map((post) => ({ ...post, reacted: session?.user?.id ? post.reactions.some((reaction) => reaction.userId === session.user.id) : false })) });
  } catch (error) {
    console.error('Erreur chargement du fil social:', error);
    return NextResponse.json({ error: 'Impossible de charger le fil social' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : null;
    const category = typeof body.category === 'string' ? body.category.trim().slice(0, 80) : null;
    const location = typeof body.location === 'string' ? body.location.trim().slice(0, 120) : null;
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.filter((url: unknown) => typeof url === 'string').slice(0, 4) : [];
    const mediaTypes = Array.isArray(body.mediaTypes) ? body.mediaTypes.slice(0, 4) : [];

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json({ error: 'Ajoutez du texte ou une photo à votre publication' }, { status: 400 });
    }
    if (content.length > 5000) return NextResponse.json({ error: 'La publication est trop longue' }, { status: 400 });

    const post = await db.socialPost.create({
      data: { authorId: session.user.id, content, title, category, location, mediaUrls, mediaTypes },
      include: {
        author: { select: { id: true, name: true, image: true, avatar: true, location: true, artisan: { select: { id: true, profession: true } } } },
        comments: { include: { author: { select: { id: true, name: true, image: true, avatar: true } } } },
        reactions: { select: { userId: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    });

    return NextResponse.json({ post: { ...post, reacted: false } }, { status: 201 });
  } catch (error) {
    console.error('Erreur création publication:', error);
    return NextResponse.json({ error: 'Impossible de publier cette réalisation' }, { status: 500 });
  }
}
