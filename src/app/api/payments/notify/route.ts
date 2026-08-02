import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST — Créer un paiement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, method, artisanId, missionId } = body;

    if (!amount || !artisanId) {
      return NextResponse.json(
        { error: 'Montant et artisanId sont requis' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: currency || 'XAF',
        method: method || null,
        status: 'en_attente',
        clientId: session.user.id,
        artisanId,
        missionId: missionId || null,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Erreur création paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}

// GET — Récupérer les paiements
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      clientId: session.user.id,
    };
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        artisan: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        mission: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Erreur récupération paiements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    );
  }
}

// PATCH — Mettre à jour un paiement
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, status, reference } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'paymentId et status sont requis' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        reference: reference || undefined,
        paidAt: status === 'payé' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Erreur mise à jour paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du paiement' },
      { status: 500 }
    );
  }
}