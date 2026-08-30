import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const profession = searchParams.get('profession') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const country = searchParams.get('country') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50';

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const maxRadius = parseFloat(radius);

    const where: any = { isAvailable: true };
    const andConditions: any[] = [];

    if (profession) {
      andConditions.push({ profession: { contains: profession, mode: 'insensitive' } });
    } else if (category) {
      andConditions.push({ profession: { contains: category, mode: 'insensitive' } });
    }

    if (q && !profession && !category) {
      andConditions.push({
        OR: [
          { profession: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { specialties: { contains: q, mode: 'insensitive' } },
          { skills: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (location) {
      const locationParts = location.split(/[,\s]+/).filter((p: string) => p.length > 1);
      const locationOr = locationParts.flatMap((part: string) => [
        { location: { contains: part, mode: 'insensitive' } },
        { address: { contains: part, mode: 'insensitive' } },
      ]);
      if (locationOr.length > 0) {
        andConditions.push({ OR: locationOr });
      }
    }

    if (country) {
      andConditions.push({ country: { contains: country, mode: 'insensitive' } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const artisans = await db.artisan.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, image: true, phone: true, lastActiveAt: true } } },
    });

    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
    let results = artisans.map((artisan) => {
      const isOnline = artisan.user?.lastActiveAt
        ? (Date.now() - new Date(artisan.user.lastActiveAt).getTime()) < ONLINE_THRESHOLD_MS
        : false;
      let distance = null;
      let distanceText = '';
      if (userLat !== null && userLng !== null && artisan.latitude !== null && artisan.longitude !== null) {
        distance = haversineDistance(userLat, userLng, artisan.latitude, artisan.longitude);
        distanceText = formatDistance(distance);
      }
      return { ...artisan, distance, distanceText, isOnline };
    });

    if (userLat !== null && userLng !== null && maxRadius > 0) {
      results = results.filter((r) => r.distance === null || r.distance <= maxRadius);
    }

    if (userLat !== null && userLng !== null) {
      results.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // On convertit les champs stockes en JSON texte (skills, specialties)
    // en vrais tableaux, sinon le frontend plante en essayant de les .map()
    const parsedResults = results.map((r: any) => {
      let skills = r.skills;
      let specialties = r.specialties;
      try { skills = typeof skills === 'string' ? JSON.parse(skills) : (skills || []); } catch { skills = []; }
      try { specialties = typeof specialties === 'string' ? JSON.parse(specialties) : (specialties || []); } catch { specialties = []; }
      return { ...r, skills: Array.isArray(skills) ? skills : [], specialties: Array.isArray(specialties) ? specialties : [] };
    });

    return NextResponse.json({ success: true, count: parsedResults.length, artisans: parsedResults });
  } catch (error) {
    console.error('Erreur recherche artisans:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}



