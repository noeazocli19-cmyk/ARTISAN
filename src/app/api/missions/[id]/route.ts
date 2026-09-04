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

    const existingMission = await db.mission.findUnique({ where: { id } });
    if (!existingMission) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    // The client who published the mission can only confirm the final completion,
    // and only after the artisan has already marked their side as done.
    if (status === 'terminee') {
      if (existingMission.clientId !== session.user.id) {
        return NextResponse.json(
          { error: "Seul le client qui a publié la mission peut confirmer sa fin." },
          { status: 403 }
        );
      }
      if (existingMission.status !== 'terminee_artisan') {
        return NextResponse.json(
          { error: "L'artisan doit d'abord indiquer que la mission est terminée." },
          { status: 400 }
        );
      }

      const mission = await db.mission.update({
        where: { id },
        data: { status: 'terminee' },
        include: {
          client: { select: { id: true, name: true, image: true, location: true, phone: true } },
          artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
      });

      if (mission.artisan?.userId) {
        await db.notification.create({
          data: {
            userId: mission.artisan.userId,
            title: 'Mission confirmée par le client',
            message: `Le client a confirmé la fin de la mission "${mission.title}". Elle compte maintenant dans vos missions terminées.`,
            type: 'mission',
            link: `/missions/${id}`,
          },
        });
      }

      return NextResponse.json({ mission });
    }

    // All other transitions (accepter, en cours, marquer terminée côté artisan) are done by the artisan
    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 });
    }

    if (status === 'terminee_artisan' && existingMission.artisanId !== artisan.id) {
      return NextResponse.json(
        { error: "Seul l'artisan assigné à cette mission peut la marquer comme terminée." },
        { status: 403 }
      );
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

    if (status === 'terminee_artisan') {
      await db.notification.create({
        data: {
          userId: mission.clientId,
          title: 'Mission terminée par l\'artisan',
          message: `L'artisan indique avoir terminé la mission "${mission.title}". Merci de confirmer pour pouvoir laisser un avis.`,
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