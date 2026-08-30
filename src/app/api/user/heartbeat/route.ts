import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }
    await db.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur heartbeat:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
