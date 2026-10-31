import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET() {
  const stories = await db.socialStory.findMany({ where: { expiresAt: { gt: new Date() } }, include: { author: { select: { id: true, name: true, image: true, avatar: true } }, artisan: { select: { id: true, profession: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ stories });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const artisan = await db.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return NextResponse.json({ error: 'Profil artisan requis' }, { status: 403 });
  const body = await request.json();
  const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : '';
  if (!mediaUrl) return NextResponse.json({ error: 'Photo ou vidéo requise' }, { status: 400 });
  const story = await db.socialStory.create({ data: { authorId: session.user.id, artisanId: artisan.id, mediaUrl, mediaType: body.mediaType === 'video' ? 'video' : 'image', caption: typeof body.caption === 'string' ? body.caption.slice(0, 500) : null, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  return NextResponse.json({ story }, { status: 201 });
}
