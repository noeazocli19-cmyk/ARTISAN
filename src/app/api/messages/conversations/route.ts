import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get all messages where user is sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        mission: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, any>();
    
    for (const msg of messages) {
      const partnerId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === session.user.id ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0,
          missionId: msg.missionId,
          mission: msg.mission,
        });
      }
      
      // Count unread
      if (msg.receiverId === session.user.id && !msg.isRead) {
        const conv = conversationsMap.get(partnerId);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Erreur conversations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}