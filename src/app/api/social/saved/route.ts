import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const saved = await db.savedSocialPost.findMany({ where: { userId: session.user.id }, include: { post: { include: { author: { select: { id: true, name: true, image: true, avatar: true } } } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ postIds: saved.map((item) => item.postId), posts: saved.map((item) => item.post) });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { postId } = await request.json();
  if (typeof postId !== 'string' || !postId) return NextResponse.json({ error: 'Publication requise' }, { status: 400 });
  const existing = await db.savedSocialPost.findUnique({ where: { userId_postId: { userId: session.user.id, postId } } });
  if (existing) return NextResponse.json({ saved: false });
  await db.savedSocialPost.create({ data: { userId: session.user.id, postId } });
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const postId = new URL(request.url).searchParams.get('postId');
  if (!postId) return NextResponse.json({ error: 'Publication requise' }, { status: 400 });
  await db.savedSocialPost.deleteMany({ where: { userId: session.user.id, postId } });
  return NextResponse.json({ saved: false });
}
