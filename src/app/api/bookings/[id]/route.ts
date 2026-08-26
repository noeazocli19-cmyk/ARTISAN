import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { status, claim } = body;

    const updateData: any = {};
    if (status) updateData.status = status;

    // "claim" = un artisan reclame une reservation encore ouverte
    if (claim) {
      const artisan = await db.artisan.findUnique({
        where: { userId: session.user.id },
      });
      if (!artisan) {
        return NextResponse.json({ error: 'Profil artisan non trouve' }, { status: 404 });
      }
      updateData.artisanId = artisan.id;
      if (!updateData.status) updateData.status = 'confirmed';
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucune donnee a mettre a jour' }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, image: true, phone: true } },
        artisan: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    try {
      const statusLabels: Record<string, string> = {
        confirmed: 'confirmee',
        completed: 'terminee',
        cancelled: 'annulee',
      };
      if (statusLabels[updateData.status]) {
        await db.notification.create({
          data: {
            userId: booking.clientId,
            title: 'Mise a jour de votre reservation',
            message: `Votre reservation "${booking.service}" est maintenant ${statusLabels[updateData.status]}`,
            type: 'mission',
            link: '/dashboard/client',
          },
        });
      }
    } catch (notifError) {
      console.error('Erreur notification (non bloquant):', notifError);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Erreur mise a jour reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
