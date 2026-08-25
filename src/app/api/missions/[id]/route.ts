import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mission = await db.mission.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, image: true, location: true, phone: true, country: true, email: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true, phone: true } } } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error('Erreur détail mission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, artisanId } = body;

    // Get the artisan profile for this user
    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (artisanId) {
      updateData.artisanId = artisanId;
    } else if (status === 'assignee' || status === 'en_cours') {
      // Auto-assign the current artisan
      updateData.artisanId = artisan.id;
    }

    const mission = await db.mission.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, image: true, location: true, phone: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    // Notify the client
    if (status === 'assignee' || status === 'en_cours') {
      await db.notification.create({
        data: {
          userId: mission.clientId,
          title: 'Mission acceptée',
          message: `Un artisan a accepté votre mission "${mission.title}"`,
          type: 'mission',
          link: `/missions/${id}`,
        },
      });
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error('Erreur mise à jour mission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}