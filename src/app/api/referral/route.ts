import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import crypto from 'crypto';

function generateCode(name: string) {
  const base = (name || 'ARTISAN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'ARTISAN';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${base}-${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    let user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (!user.referralCode) {
      let code = generateCode(user.name || '');
      let attempt = 0;
      while (attempt < 5) {
        const existing = await db.user.findUnique({ where: { referralCode: code } });
        if (!existing) break;
        code = generateCode(user.name || '');
        attempt++;
      }
      user = await db.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });
    }

    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      include: { referee: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const creditsEarned = referrals.reduce((sum, r) => sum + r.creditsEarned, 0);

    return NextResponse.json({
      stats: {
        code: user.referralCode,
        totalInvites: referrals.length,
        successfulReferrals: referrals.length,
        creditsEarned,
        creditsUsed: 0,
        creditsAvailable: creditsEarned,
      },
      invites: referrals.map((r) => ({
        id: r.id,
        inviteeName: r.referee?.name || 'Utilisateur',
        inviteeEmail: r.referee?.email || '',
        status: 'completed',
        creditsEarned: r.creditsEarned,
        date: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Erreur parrainage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, newUserId } = body;

    if (!code || !newUserId) {
      return NextResponse.json({ error: 'code et newUserId requis' }, { status: 400 });
    }

    const referrer = await db.user.findUnique({ where: { referralCode: code } });
    if (!referrer) {
      return NextResponse.json({ error: 'Code de parrainage invalide' }, { status: 404 });
    }

    if (referrer.id === newUserId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous parrainer vous-meme' }, { status: 400 });
    }

    const existing = await db.referral.findUnique({ where: { refereeId: newUserId } });
    if (existing) {
      return NextResponse.json({ error: 'Ce compte a deja ete parraine' }, { status: 409 });
    }

    const referral = await db.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: newUserId,
        creditsEarned: 500,
      },
    });

    try {
      await db.notification.create({
        data: {
          userId: referrer.id,
          title: 'Nouveau filleul !',
          message: 'Quelqu\'un vient de s\'inscrire grace a votre lien de parrainage. +500 FCFA de credit !',
          type: 'system',
        },
      });
    } catch (notifError) {
      console.error('Erreur notification parrainage (non bloquant):', notifError);
    }

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error('Erreur creation parrainage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
