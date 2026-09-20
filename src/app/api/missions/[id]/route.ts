import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import { sendWebPushToUser } from '@/lib/push';
import { computeArtisanBadge } from '@/lib/badges';

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
        payments: true,
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

      // La mission compte maintenant vraiment dans les stats de l'artisan
      if (mission.artisanId) {
        const newMissionCount = (mission.artisan?.missionCount ?? 0) + 1;
        const newBadge = computeArtisanBadge(
          newMissionCount,
          mission.artisan?.reviewCount ?? 0,
          mission.artisan?.rating ?? 0
        );
        await db.artisan.update({
          where: { id: mission.artisanId },
          data: { missionCount: newMissionCount, badge: newBadge },
        });
      }

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
        try {
          await sendWebPushToUser(mission.artisan.userId, {
            title: 'Mission confirmée',
            body: `Le client a confirmé la fin de "${mission.title}".`,
            url: `/missions/${id}`,
          })
        } catch (e) {
          console.error('Erreur envoi push mission terminee (non bloquant):', e)
        }
      }

      return NextResponse.json({ mission });
    }

    // Either the client or the artisan can raise a dispute on an active mission.
    if (status === 'litige') {
      const isClient = existingMission.clientId === session.user.id;
      const requesterArtisan = await db.artisan.findUnique({ where: { userId: session.user.id } });
      const isArtisan = requesterArtisan && existingMission.artisanId === requesterArtisan.id;

      if (!isClient && !isArtisan) {
        return NextResponse.json(
          { error: "Vous n'êtes pas concerné par cette mission." },
          { status: 403 }
        );
      }

      if (!['assignee', 'en_cours', 'terminee_artisan'].includes(existingMission.status)) {
        return NextResponse.json(
          { error: "Un litige ne peut être signalé que sur une mission en cours." },
          { status: 400 }
        );
      }

      const { disputeReason } = body;
      if (!disputeReason || !disputeReason.trim()) {
        return NextResponse.json(
          { error: "Merci d'expliquer le problème rencontré." },
          { status: 400 }
        );
      }

      const mission = await db.mission.update({
        where: { id },
        data: { status: 'litige', disputeReason: disputeReason.trim() },
        include: {
          client: { select: { id: true, name: true } },
          artisan: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      // Notify the other party
      const otherPartyUserId = isClient ? mission.artisan?.userId : mission.clientId;
      if (otherPartyUserId) {
        await db.notification.create({
          data: {
            userId: otherPartyUserId,
            title: 'Litige signalé sur une mission',
            message: `Un problème a été signalé sur la mission "${mission.title}". Notre équipe va examiner la situation.`,
            type: 'mission',
            link: `/missions/${id}`,
          },
        });
        try {
          await sendWebPushToUser(otherPartyUserId, {
            title: 'Litige signalé',
            body: `Un litige a été signalé sur "${mission.title}".`,
            url: `/missions/${id}`,
          })
        } catch (e) {
          console.error('Erreur envoi push litige (non bloquant):', e)
        }
      }

      // Notify any admin so it can be reviewed
      const admins = await db.user.findMany({ where: { role: 'admin' }, select: { id: true } });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Nouveau litige à examiner',
            message: `Litige sur la mission "${mission.title}" : ${disputeReason.trim()}`,
            type: 'mission',
            link: `/missions/${id}`,
          })),
        });
        try {
          for (const admin of admins) {
            await sendWebPushToUser(admin.id, {
              title: 'Nouveau litige',
              body: `Litige sur "${mission.title}" : ${disputeReason.trim()}`,
              url: `/missions/${id}`,
            })
          }
        } catch (e) {
          console.error('Erreur envoi push admin litige (non bloquant):', e)
        }
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
      try {
        await sendWebPushToUser(mission.clientId, {
          title: 'Mission acceptée',
          body: `Un artisan a accepté votre mission "${mission.title}"`,
          url: `/missions/${id}`,
        })
      } catch (e) {
        console.error('Erreur envoi push mission accepte (non bloquant):', e)
      }
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
      try {
        await sendWebPushToUser(mission.clientId, {
          title: 'Mission terminée par l\'artisan',
          body: `L'artisan indique avoir terminé la mission "${mission.title}".`,
          url: `/missions/${id}`,
        })
      } catch (e) {
        console.error('Erreur envoi push mission terminee_artisan (non bloquant):', e)
      }
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error('Erreur mise à jour mission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}