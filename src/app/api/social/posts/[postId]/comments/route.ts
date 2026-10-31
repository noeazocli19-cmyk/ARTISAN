import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { content } = await request.json();
    const text = typeof content === 'string' ? content.trim() : '';
    if (!text) return NextResponse.json({ error: 'Le commentaire ne peut pas être vide' }, { status: 400 });
    if (text.length > 1000) return NextResponse.json({ error: 'Commentaire trop long' }, { status: 400 });
    if (!await db.socialPost.findUnique({ where: { id: postId }, select: { id: true } })) {
      return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 });
    }
    const comment = await db.socialComment.create({
      data: { postId, authorId: session.user.id, content: text },
      include: { author: { select: { id: true, name: true, image: true, avatar: true } } },
    });
    const postAuthor = await db.socialPost.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
    if (postAuthor && postAuthor.authorId !== session.user.id) {
      await db.notification.create({ data: { userId: postAuthor.authorId, title: 'Nouveau commentaire', message: 'Un utilisateur a commenté votre réalisation.', type: 'social', link: `/social/${postId}` } });
    }
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Erreur commentaire social:', error);
    return NextResponse.json({ error: 'Impossible d’ajouter le commentaire' }, { status: 500 });
  }
}
