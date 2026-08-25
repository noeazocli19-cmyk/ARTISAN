import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const artisanId = searchParams.get('artisanId');
    const status = searchParams.get('status');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (artisanId) where.artisanId = artisanId;
    if (status) where.status = status;

    const bookings = await db.booking.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, image: true, phone: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Erreur recuperation reservations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }
    const body = await request.json();
    const { artisanId, service, date, notes } = body;

    if (!artisanId || !service || !date) {
      return NextResponse.json({ error: 'artisanId, service et date sont requis' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        clientId: session.user.id,
        artisanId,
        service,
        date: new Date(date),
        notes: notes || null,
        status: 'pending',
      },
      include: {
        client: { select: { id: true, name: true, image: true, phone: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    try {
      await db.notification.create({
        data: {
          userId: booking.artisan.userId,
          title: 'Nouvelle demande de reservation',
          message: `${session.user.name} souhaite reserver: ${service}`,
          type: 'mission',
          link: '/dashboard/artisan',
        },
      });
    } catch (notifError) {
      console.error('Erreur notification reservation (non bloquant):', notifError);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Erreur creation reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}


