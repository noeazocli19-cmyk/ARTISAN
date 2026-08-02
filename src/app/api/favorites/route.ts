import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET — Récupérer les favoris
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { clientId: session.user.id },
      include: {
        artisan: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Erreur favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

// POST — Ajouter ou retirer un favori
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { artisanId } = body;

    if (!artisanId) {
      return NextResponse.json(
        { error: 'artisanId est requis' },
        { status: 400 }
      );
    }

    // Vérifier si déjà en favori
    const existing = await prisma.favorite.findUnique({
      where: {
        clientId_artisanId: {
          clientId: session.user.id,
          artisanId,
        },
      },
    });

    if (existing) {
      // Supprimer le favori
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    }

    // Ajouter le favori
    const favorite = await prisma.favorite.create({
      data: {
        clientId: session.user.id,
        artisanId,
      },
    });

    return NextResponse.json({ favorited: true, favorite }, { status: 201 });
  } catch (error) {
    console.error('Erreur favori:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la gestion du favori' },
      { status: 500 }
    );
  }
}