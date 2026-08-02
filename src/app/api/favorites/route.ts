import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: { clientId: session.user.id },
      include: { artisan: { include: { user: { select: { id: true, name: true, image: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Erreur favoris:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des favoris' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { artisanId } = body;

    if (!artisanId) {
      return NextResponse.json({ error: 'artisanId est requis' }, { status: 400 });
    }

    const existing = await db.favorite.findUnique({
      where: { clientId_artisanId: { clientId: session.user.id, artisanId } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    const favorite = await db.favorite.create({
      data: { clientId: session.user.id, artisanId },
    });

    return NextResponse.json({ favorited: true, favorite }, { status: 201 });
  } catch (error) {
    console.error('Erreur favori:', error);
    return NextResponse.json({ error: 'Erreur lors de la gestion du favori' }, { status: 500 });
  }
}