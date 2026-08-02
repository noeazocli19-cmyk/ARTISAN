import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Calcul distance Haversine entre 2 points GPS
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET — Rechercher des artisans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const country = searchParams.get('country') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50';

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const maxRadius = parseFloat(radius);

    // Construire les filtres
    const where: any = {};

    if (q) {
      where.OR = [
        { profession: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { skills: { has: q } },
      ];
    }

    if (category) {
      where.profession = { contains: category, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    // Récupérer les artisans
    const artisans = await prisma.artisan.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Calculer la distance et filtrer par rayon
    let results = artisans.map((artisan) => {
      let distance = null;

      if (
        userLat !== null &&
        userLng !== null &&
        artisan.latitude !== null &&
        artisan.longitude !== null
      ) {
        distance = haversineDistance(
          userLat,
          userLng,
          artisan.latitude,
          artisan.longitude
        );
      }

      return {
        ...artisan,
        distance,
      };
    });

    // Filtrer par rayon si géolocalisation active
    if (userLat !== null && userLng !== null && maxRadius > 0) {
      results = results.filter(
        (r) => r.distance === null || r.distance <= maxRadius
      );
    }

    // Trier par proximité (les plus proches d'abord)
    if (userLat !== null && userLng !== null) {
      results.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      artisans: results,
    });
  } catch (error) {
    console.error('Erreur recherche artisans:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}