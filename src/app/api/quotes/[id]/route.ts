import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  const quote = await db.quote.findUnique({ where: { id }, include: { artisan: true } });
  if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });
  const isArtisan = quote.artisan.userId === session.user.id;
  const isClient = quote.clientId === session.user.id;
  const body = await request.json();
  const status = typeof body.status === 'string' ? body.status : quote.status;

  if (!['accepte', 'refuse', 'en_attente', 'expire'].includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  if ((status === 'accepte' || status === 'refuse') && !isArtisan) return NextResponse.json({ error: 'Seul l’artisan peut répondre' }, { status: 403 });
  if (status === 'expire' && !isClient) return NextResponse.json({ error: 'Seul le client peut annuler le devis' }, { status: 403 });

  let mission = quote.missionId ? await db.mission.findUnique({ where: { id: quote.missionId } }) : null;
  const amount = Number(body.amount ?? quote.amount) || quote.amount;
  if (status === 'accepte' && !mission) {
    mission = await db.mission.create({ data: { title: quote.title, description: quote.description || quote.artisanNote || undefined, budget: amount, clientId: quote.clientId, artisanId: quote.artisanId, status: 'confirmee' } });
    await db.quote.update({ where: { id }, data: { missionId: mission.id, status, amount, artisanNote: typeof body.note === 'string' ? body.note.slice(0, 1000) : quote.artisanNote } });
  } else {
    await db.quote.update({ where: { id }, data: { status, amount, artisanNote: typeof body.note === 'string' ? body.note.slice(0, 1000) : quote.artisanNote } });
  }
  return NextResponse.json({ quote: await db.quote.findUnique({ where: { id }, include: { mission: true } }), mission });
}
