import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!await db.socialPost.findUnique({ where: { id: postId }, select: { id: true } })) {
    return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 });
  }
  const existingReaction = await db.socialReaction.findUnique({ where: { postId_userId: { postId, userId: session.user.id } } });
  await db.socialReaction.upsert({
    where: { postId_userId: { postId, userId: session.user.id } },
    create: { postId, userId: session.user.id },
    update: {},
  });
  const post = await db.socialPost.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!existingReaction && post && post.authorId !== session.user.id) {
    await db.notification.create({ data: { userId: post.authorId, title: 'Nouvelle réaction', message: 'Votre réalisation a reçu une nouvelle réaction.', type: 'social', link: `/social/${postId}` } });
  }
  return NextResponse.json({ reacted: true }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  await db.socialReaction.deleteMany({ where: { postId, userId: session.user.id } });
  return NextResponse.json({ reacted: false });
}
