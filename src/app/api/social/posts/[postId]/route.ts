import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(_request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const post = await db.socialPost.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, image: true, avatar: true, location: true, artisan: { select: { profession: true } } } },
      comments: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true, image: true, avatar: true } } } },
      reactions: { select: { userId: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });
  if (!post) return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const post = await db.socialPost.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim() : undefined;
  if (content !== undefined && !content) return NextResponse.json({ error: 'Le texte de la publication est requis' }, { status: 400 });
  if (content && content.length > 5000) return NextResponse.json({ error: 'La publication est trop longue' }, { status: 400 });
  const updated = await db.socialPost.update({
    where: { id: postId },
    data: {
      ...(content !== undefined ? { content } : {}),
      ...(typeof body.title === 'string' ? { title: body.title.trim().slice(0, 120) || null } : {}),
      ...(typeof body.category === 'string' ? { category: body.category.trim().slice(0, 80) || null } : {}),
      ...(typeof body.location === 'string' ? { location: body.location.trim().slice(0, 120) || null } : {}),
    },
  });
  return NextResponse.json({ post: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const post = await db.socialPost.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  await db.socialPost.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
