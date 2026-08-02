import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const artisanId = searchParams.get('artisanId');
    const missionId = searchParams.get('missionId');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (artisanId) where.artisanId = artisanId;
    if (missionId) where.missionId = missionId;

    const reviews = await db.review.findMany({
      where,
      include: { client: { select: { id: true, name: true, image: true } }, mission: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment, artisanId, missionId } = body;

    if (!rating || !artisanId) {
      return NextResponse.json({ error: 'Note et artisanId sont requis' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 });
    }

    if (missionId) {
      const existingReview = await db.review.findFirst({ where: { missionId, clientId: session.user.id } });
      if (existingReview) {
        return NextResponse.json({ error: 'Vous avez déjà donné un avis pour cette mission' }, { status: 409 });
      }
    }

    const review = await db.review.create({
      data: { rating, comment, clientId: session.user.id, artisanId, missionId: missionId || null },
      include: { client: { select: { id: true, name: true, image: true } }, artisan: { include: { user: { select: { id: true, name: true } } } } },
    });

    const artisanReviews = await db.review.findMany({ where: { artisanId }, select: { rating: true } });
    const totalRating = artisanReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / artisanReviews.length;

    await db.artisan.update({
      where: { id: artisanId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: artisanReviews.length },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Erreur création avis:', error);
    return NextResponse.json({ error: "Erreur lors de la création de l'avis" }, { status: 500 });
  }
}