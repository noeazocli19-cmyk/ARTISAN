import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Haversine formula (distance in km) ─────────────────────────────────
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
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

    const userConditions: any[] = []

    if (q) {
      userConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      })
    }

    if (location) {
      userConditions.push({
        location: { contains: location, mode: 'insensitive' },
      })
    }

    if (country) {
      userConditions.push({
        country: { contains: country, mode: 'insensitive' },
      })
    }

    if (userConditions.length > 0) {
      whereClause.user5 = { AND: userConditions }
    }

    if (category) {
      whereClause.OR = [
        { specialties: { contains: category, mode: 'insensitive' } },
        { skills: { contains: category, mode: 'insensitive' } },
      ]
    }

    const artisans = await prisma.artisan.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            location: true,
            country: true,
            phone: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { missionCount: 'desc' }],
      take: 100,
    })

    // ─── Calculate distance and sort by proximity ────────────────────────
    let results = artisans.map((artisan) => {
      let distanceKm: number | null = null

      if (
        clientLat !== null &&
        clientLng !== null &&
        artisan.user?.latitude !== null &&
        artisan.user?.longitude !== null
      ) {
        distanceKm = haversineDistance(
          clientLat,
          clientLng,
          artisan.user!.latitude!,
          artisan.user!.longitude!
        )
      }

      return { ...artisan, distanceKm }
    })

    // Filter by radius if specified
    if (radiusKm !== null && clientLat !== null && clientLng !== null) {
      results = results.filter(
        (r) => r.distanceKm !== null && r.distanceKm <= radiusKm
      )
    }

    // Sort by distance if client location provided, otherwise by rating
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
  } finally {
    await prisma.$disconnect()
  }
}