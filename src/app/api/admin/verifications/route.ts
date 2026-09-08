import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  if (user?.role !== 'admin') return null;
  return user;
}

// GET: liste des demandes de vérification en attente (admin uniquement)
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
  }

  const artisans = await db.artisan.findMany({
    where: { identityStatus: { in: ['en_attente', 'approuve', 'refuse'] } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ artisans });
}

// PATCH: approuver ou refuser une demande (admin uniquement)
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
  }

  const { artisanId, decision } = await request.json();
  if (!artisanId || !['approuve', 'refuse'].includes(decision)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }

  const artisan = await db.artisan.update({
    where: { id: artisanId },
    data: { identityStatus: decision },
  });

  await db.notification.create({
    data: {
      userId: artisan.userId,
      title: decision === 'approuve' ? 'Identité vérifiée !' : 'Vérification refusée',
      message: decision === 'approuve'
        ? 'Votre pièce d\'identité a été vérifiée. Votre profil affiche maintenant le badge de confiance.'
        : 'Votre pièce d\'identité n\'a pas pu être validée. Vous pouvez en soumettre une nouvelle.',
      type: decision === 'approuve' ? 'success' : 'warning',
    },
  });

  return NextResponse.json({ success: true, identityStatus: artisan.identityStatus });
}
