import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CATEGORY_PROFESSION_MAP } from '@/lib/categories-map';

export async function GET() {
  try {
    const artisans = await db.artisan.findMany({
      where: { isAvailable: true },
      select: { profession: true },
    });

    const counts: Record<string, number> = {};

    for (const category of Object.keys(CATEGORY_PROFESSION_MAP)) {
      const synonyms = CATEGORY_PROFESSION_MAP[category].map((s) => s.toLowerCase());
      counts[category] = artisans.filter((a) => {
        const prof = (a.profession || '').toLowerCase();
        return synonyms.some((s) => prof.includes(s.toLowerCase()));
      }).length;
    }

    return NextResponse.json({ success: true, counts, total: artisans.length });
  } catch (error) {
    console.error('Erreur comptage categories:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
