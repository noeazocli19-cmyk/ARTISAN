import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWebPushToUser } from '@/lib/push';
import { auth } from '@/lib/better-auth';

// POST: l'artisan soumet sa pièce d'identité
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { documentUrl } = await request.json();
    if (!documentUrl) {
      return NextResponse.json({ error: 'Document manquant' }, { status: 400 });
    }

    const artisan = await db.artisan.findUnique({ where: { userId: session.user.id } });
    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 });
    }

    const updated = await db.artisan.update({
      where: { id: artisan.id },
      data: { identityDocument: documentUrl, identityStatus: 'en_attente' },
    });

    const admins = await db.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: 'Nouvelle demande de vérification',
          message: `${session.user.name} a soumis une pièce d'identité pour vérification.`,
          type: 'info',
          link: '/admin/verifications',
        })),
      });
      try {
        for (const a of admins) {
          await sendWebPushToUser(a.id, {
            title: 'Nouvelle demande de vérification',
            body: `${session.user.name} a soumis une pièce d'identité pour vérification.`,
            url: '/admin/verifications',
          })
        }
      } catch (e) {
        console.error('Erreur envoi push nouvelle demande verification (non bloquant):', e)
      }
    }

    return NextResponse.json({ success: true, identityStatus: updated.identityStatus });
  } catch (error) {
    console.error('Erreur soumission identité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET: l'artisan consulte le statut de sa propre demande
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
      select: { identityStatus: true, identityDocument: true },
    });

    return NextResponse.json({
      identityStatus: artisan?.identityStatus || 'non_soumis',
      hasDocument: !!artisan?.identityDocument,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
