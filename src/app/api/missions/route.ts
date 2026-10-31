import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { sendWebPushToUser } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, budget, location, latitude, longitude, phone, artisanId } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Titre, description et catégorie sont requis' }, { status: 400 });
    }

    // Update user phone if provided
    if (phone && session.user.id) {
      await db.user.update({
        where: { id: session.user.id },
        data: { phone },
      });
    }

    let selectedArtisanId: string | null = null;
    let selectedArtisanUserId: string | null = null;
    if (typeof artisanId === 'string' && artisanId) {
      const selectedArtisan = await db.artisan.findUnique({ where: { id: artisanId }, select: { id: true, userId: true } });
      if (selectedArtisan) {
        selectedArtisanId = selectedArtisan.id;
        selectedArtisanUserId = selectedArtisan.userId;
      }
    }

    const mission = await db.mission.create({
      data: {
        title, description, category, budget: budget || 0,
        location: location || null, latitude: latitude || null, longitude: longitude || null,
        clientId: session.user.id,
        ...(selectedArtisanId ? { artisanId: selectedArtisanId } : {}),
      },
      include: {
        client: { select: { id: true, name: true, image: true, location: true, phone: true, country: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });


    if (selectedArtisanId && selectedArtisanUserId) {
      try {
        await db.notification.create({
          data: {
            userId: selectedArtisanUserId,
            title: 'Nouvelle demande personnalisée',
            message: `${session.user.name || 'Un client'} vous a demandé un devis pour « ${title} »`,
            type: 'mission',
            link: '/dashboard/artisan',
          },
        });
        await sendWebPushToUser(selectedArtisanUserId, {
          title: 'Nouvelle demande personnalisée',
          body: `${session.user.name || 'Un client'} vous a demandé un devis pour « ${title} »`,
          url: '/dashboard/artisan',
        });
      } catch (notificationError) {
        console.error('Erreur notification demande ciblée (non bloquant):', notificationError);
      }
    }

    // Notifier les artisans dont le metier correspond a la categorie de la mission
    try {
      const matchingArtisans = await db.artisan.findMany({
        where: { profession: { contains: category, mode: "insensitive" } },
        select: { userId: true },
      });
      const otherMatchingArtisans = matchingArtisans.filter((artisan) => artisan.userId !== selectedArtisanUserId);
      if (otherMatchingArtisans.length > 0) {
        await db.notification.createMany({
          data: otherMatchingArtisans.map((a) => ({
            userId: a.userId,
            title: "Nouvelle mission disponible",
            message: `Une mission \"${title}\" correspond a votre metier`,
            type: "mission",
            link: `/dashboard/artisan`,
          })),
        });
        try {
          for (const a of otherMatchingArtisans) {
            await sendWebPushToUser(a.userId, {
              title: 'Nouvelle mission disponible',
              body: `Une mission "${title}" correspond a votre metier`,
              url: `/dashboard/artisan`,
            })
          }
        } catch (e) {
          console.error('Erreur envoi push mission (non bloquant):', e)
        }
      }
    } catch (notifError) {
      console.error("Erreur notification nouvelle mission (non bloquant):", notifError);
    }

    return NextResponse.json({ mission }, { status: 201 });
  } catch (error) {
    console.error('Erreur création mission:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la mission' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const artisanId = searchParams.get('artisanId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const skip = (page - 1) * limit;

    if (clientId && clientId !== session?.user?.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    let ownedArtisanId: string | null = null;
    if (artisanId) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      const artisan = await db.artisan.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!artisan || artisan.id !== artisanId) {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
      }
      ownedArtisanId = artisan.id;
    }

    if (status && status !== 'ouverte' && !clientId && !ownedArtisanId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (ownedArtisanId) where.artisanId = ownedArtisanId;
    where.status = status || (clientId || ownedArtisanId ? undefined : 'ouverte');
    if (!where.status) delete where.status;
    if (category) where.category = category;

    const [missions, total] = await Promise.all([
      db.mission.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, image: true, location: true, country: true } },
          artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.mission.count({ where }),
    ]);

    return NextResponse.json({ missions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Erreur récupération missions:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des missions' }, { status: 500 });
  }
}
