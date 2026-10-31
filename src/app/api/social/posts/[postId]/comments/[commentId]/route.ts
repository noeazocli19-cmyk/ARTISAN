import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function PATCH(request: NextRequest, context: { params: Promise<{ postId: string; commentId: string }> }) {
  const { postId, commentId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const comment = await db.socialComment.findUnique({ where: { id: commentId }, select: { authorId: true, postId: true } });
  if (!comment) return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
  if (comment.postId !== postId) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  if (comment.authorId !== session.user.id) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) return NextResponse.json({ error: 'Le commentaire ne peut pas être vide' }, { status: 400 });
  if (content.length > 1000) return NextResponse.json({ error: 'Commentaire trop long' }, { status: 400 });
  const updated = await db.socialComment.update({ where: { id: commentId }, data: { content } });
  return NextResponse.json({ comment: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string; commentId: string }> }) {
  const { postId, commentId } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const comment = await db.socialComment.findUnique({ where: { id: commentId }, select: { authorId: true, postId: true } });
  if (!comment) return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
  if (comment.postId !== postId || comment.authorId !== session.user.id) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  await db.socialComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
