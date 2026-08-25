import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const country = searchParams.get('country') || ''
    const clientLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const clientLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null

    const whereClause: any = {
      isAvailable: true,
    }

    const andConditions: any[] = []

    if (q) {
      andConditions.push({
        OR: [
          { profession: { contains: q, mode: 'insensitive' } },
          { specialties: { contains: q, mode: 'insensitive' } },
          { skills: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      })
    }

    if (category) {
      andConditions.push({
        OR: [
          { profession: { contains: category, mode: 'insensitive' } },
          { specialties: { contains: category, mode: 'insensitive' } },
          { skills: { contains: category, mode: 'insensitive' } },
        ],
      })
    }

    if (location) {
      const locationParts = location.split(/[,\s]+/).filter((p: string) => p.length > 1)
      const locationOr = locationParts.flatMap((part: string) => [
        { location: { contains: part, mode: 'insensitive' } },
        { address: { contains: part, mode: 'insensitive' } },
      ])
      if (locationOr.length > 0) {
        andConditions.push({ OR: locationOr })
      }
    }

    if (country) {
      andConditions.push({ country: { contains: country, mode: 'insensitive' } })
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions
    }

    const artisans = await db.artisan.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { missionCount: 'desc' }],
      take: 100,
    })

    let results = artisans.map((artisan) => {
      let distanceKm: number | null = null

      if (
        clientLat !== null &&
        clientLng !== null &&
        artisan.latitude !== null &&
        artisan.longitude !== null
      ) {
        distanceKm = haversineDistance(clientLat, clientLng, artisan.latitude, artisan.longitude)
      }

      return { ...artisan, distanceKm }
    })

    if (radiusKm !== null && clientLat !== null && clientLng !== null) {
      results = results.filter((r) => r.distanceKm !== null && r.distanceKm <= radiusKm)
    }

    if (clientLat !== null && clientLng !== null) {
      results.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0
        if (a.distanceKm === null) return 1
        if (b.distanceKm === null) return -1
        return a.distanceKm - b.distanceKm
      })
    }

    return NextResponse.json({
      success: true,
      artisans: results,
      count: results.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    )
  }
}

