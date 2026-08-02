import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, budget, location, latitude, longitude } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Titre, description et catégorie sont requis' }, { status: 400 });
    }

    const mission = await db.mission.create({
      data: {
        title, description, category, budget: budget || 0,
        location: location || null, latitude: latitude || null, longitude: longitude || null,
        clientId: session.user.id,
      },
      include: {
        client: { select: { id: true, name: true, image: true, location: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch (error) {
    console.error('Erreur création mission:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la mission' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const artisanId = searchParams.get('artisanId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (artisanId) where.artisanId = artisanId;
    if (status) where.status = status;

    const [missions, total] = await Promise.all([
      db.mission.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, image: true, location: true } },
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