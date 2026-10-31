import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const artisan = await db.artisan.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  const quotes = await db.quote.findMany({
    where: artisan ? { OR: [{ clientId: session.user.id }, { artisanId: artisan.id }] } : { clientId: session.user.id },
    include: { client: { select: { id: true, name: true, image: true } }, artisan: { include: { user: { select: { id: true, name: true, image: true } } } }, mission: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ quotes });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await request.json();
  const artisanId = typeof body.artisanId === 'string' ? body.artisanId : '';
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 5000) : '';
  if (!artisanId || !title) return NextResponse.json({ error: 'Artisan et titre requis' }, { status: 400 });
  const artisan = await db.artisan.findUnique({ where: { id: artisanId }, select: { id: true, userId: true } });
  if (!artisan) return NextResponse.json({ error: 'Artisan introuvable' }, { status: 404 });

  const quote = await db.quote.create({ data: { clientId: session.user.id, artisanId, title, description, amount: Number(body.amount) || 0 } });
  await db.notification.create({ data: { userId: artisan.userId, title: 'Nouvelle demande de devis', message: `${session.user.name || 'Un client'} demande un devis pour « ${title} »`, type: 'quote', link: '/dashboard/artisan' } }).catch(() => null);
  return NextResponse.json({ quote }, { status: 201 });
}
