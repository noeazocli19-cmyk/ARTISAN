import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');
    const receiverId = searchParams.get('receiverId');

    const where: any = {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    };

    if (missionId) where.missionId = missionId;
    if (receiverId) {
      where.OR = [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ];
    }

    const messages = await db.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erreur messages:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { content, receiverId, missionId, type } = body;

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Contenu et receiverId sont requis' }, { status: 400 });
    }

    const validTypes = ['audio', 'image', 'text'];
    const messageType = validTypes.includes(type) ? type : 'text';

    const message = await db.message.create({
      data: { content, type: messageType, senderId: session.user.id, receiverId, missionId: missionId || null },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'Nouveau message',
        message: messageType === 'audio'
          ? `${session.user.name} vous a envoyé un message vocal`
          : messageType === 'image'
          ? `${session.user.name} vous a envoyé une photo`
          : `${session.user.name} vous a envoyé un message`,
        type: 'message',
        link: missionId ? `/missions/${missionId}` : null,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}