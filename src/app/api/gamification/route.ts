import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

function computePoints(missionCount: number, reviewCount: number, rating: number) {
  return missionCount * 100 + reviewCount * 30 + Math.round(rating * 20);
}

function computeLevel(points: number) {
  let level = 1;
  let threshold = 200;
  let remaining = points;
  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = Math.round(threshold * 1.25);
  }
  const titles = ['Debutant', 'Apprenti', 'Confirme', 'Expert', 'Maitre', 'Elite'];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  return { level, title, xp: remaining, xpToNext: threshold };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan non trouve' }, { status: 404 });
    }

    const fiveStarCount = await db.review.count({
      where: { artisanId: artisan.id, rating: 5 },
    });

    const points = computePoints(artisan.missionCount, artisan.reviewCount, artisan.rating);
    const levelInfo = computeLevel(points);

    const badges = [
      {
        id: 'b1', name: 'Premiere Mission', description: 'Completez votre premiere mission avec succes',
        icon: '🎯', category: 'achievement',
        earned: artisan.missionCount >= 1, progress: Math.min(artisan.missionCount, 1), maxProgress: 1,
      },
      {
        id: 'b2', name: '5 Avis Positifs', description: 'Recevez 5 avis positifs de clients satisfaits',
        icon: '⭐', category: 'social',
        earned: artisan.reviewCount >= 5, progress: Math.min(artisan.reviewCount, 5), maxProgress: 5,
      },
      {
        id: 'b6', name: '10 Missions Reussies', description: 'Completez 10 missions',
        icon: '✅', category: 'achievement',
        earned: artisan.missionCount >= 10, progress: Math.min(artisan.missionCount, 10), maxProgress: 10,
      },
      {
        id: 'b9', name: '100 Missions', description: 'Completez 100 missions au total',
        icon: '🏆', category: 'achievement',
        earned: artisan.missionCount >= 100, progress: Math.min(artisan.missionCount, 100), maxProgress: 100,
      },
      {
        id: 'b10', name: '20 Avis 5 Etoiles', description: 'Recevez 20 avis avec la note maximale',
        icon: '🌟', category: 'social',
        earned: fiveStarCount >= 20, progress: Math.min(fiveStarCount, 20), maxProgress: 20,
      },
      {
        id: 'b3', name: 'Master du Metier', description: 'Completez 20 missions dans votre specialite',
        icon: '🔧', category: 'skill',
        earned: false, progress: 0, maxProgress: 20,
      },
      {
        id: 'b4', name: '30 Jours Consecutifs', description: 'Connectez-vous 30 jours de suite',
        icon: '🔥', category: 'loyalty',
        earned: false, progress: 0, maxProgress: 30,
      },
      {
        id: 'b7', name: 'Ambassadeur', description: 'Parrainez 5 nouveaux artisans sur la plateforme',
        icon: '🤝', category: 'social',
        earned: false, progress: 0, maxProgress: 5,
      },
    ];

    const earnedCount = badges.filter((b) => b.earned).length;

    const allArtisans = await db.artisan.findMany({
      include: { user: { select: { name: true } } },
      take: 100,
    });

    const leaderboard = allArtisans
      .map((a) => {
        const p = computePoints(a.missionCount, a.reviewCount, a.rating);
        return {
          artisanId: a.id,
          name: a.user?.name || 'Artisan',
          level: computeLevel(p).level,
          points: p,
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 20)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    const myRank = leaderboard.find((e) => e.artisanId === artisan.id)?.rank ?? null;

    return NextResponse.json({
      profile: {
        level: levelInfo,
        points,
        badges,
        earnedCount,
        totalBadges: badges.length,
        rank: myRank,
        missionCount: artisan.missionCount,
        reviewCount: artisan.reviewCount,
        rating: artisan.rating,
      },
      leaderboard,
    });
  } catch (error) {
    console.error('Erreur gamification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
