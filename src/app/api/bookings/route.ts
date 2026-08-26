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

    let where: any = {};

    if (clientId) {
      where.clientId = clientId;
      if (status) where.status = status;
    } else if (artisanId) {
      // Un artisan voit : ses reservations deja assignees a lui,
      // OU les reservations encore ouvertes qui correspondent a son metier.
      const artisan = await db.artisan.findUnique({ where: { id: artisanId } });
      const profession = artisan?.profession || '';
      where = {
        OR: [
          { artisanId },
          {
            artisanId: null,
            ...(profession ? { category: { contains: profession, mode: 'insensitive' } } : {}),
          },
        ],
      };
      if (status) where.status = status;
    } else if (status) {
      where.status = status;
    }

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
    const { artisanId, service, category, date, notes } = body;

    if (!service || !date) {
      return NextResponse.json({ error: 'service et date sont requis' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        clientId: session.user.id,
        artisanId: artisanId || null,
        service,
        category: category || service,
        date: new Date(date),
        notes: notes || null,
        status: 'pending',
      },
      include: {
        client: { select: { id: true, name: true, image: true, phone: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    // Notifier soit l'artisan choisi, soit tous les artisans du bon metier
    try {
      if (booking.artisanId && booking.artisan) {
        await db.notification.create({
          data: {
            userId: booking.artisan.userId,
            title: 'Nouvelle demande de reservation',
            message: `${session.user.name} souhaite reserver: ${service}`,
            type: 'mission',
            link: '/dashboard/artisan',
          },
        });
      } else {
        const searchCategory = category || service;
        const matchingArtisans = await db.artisan.findMany({
          where: { profession: { contains: searchCategory, mode: 'insensitive' } },
          select: { userId: true },
        });
        if (matchingArtisans.length > 0) {
          await db.notification.createMany({
            data: matchingArtisans.map((a) => ({
              userId: a.userId,
              title: 'Nouvelle demande de reservation',
              message: `Une reservation "${service}" correspond a votre metier`,
              type: 'mission',
              link: '/dashboard/artisan',
            })),
          });
        }
      }
    } catch (notifError) {
      console.error('Erreur notification reservation (non bloquant):', notifError);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Erreur creation reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
