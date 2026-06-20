import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { cached, TTL } from '@/lib/cache'

export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per 60 seconds for search
  const limiter = rateLimit(request, { limit: 60, window: 60 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de recherches. Veuillez réessayer dans quelques secondes.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const type = searchParams.get('type') || 'all'

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre de recherche "q" est requis' },
        { status: 400 }
      )
    }

    const searchTerm = q.trim()

    // Cache search results for 10 seconds
    const cacheKey = `search:${searchTerm}:${type}`
    const results = await cached(cacheKey, async () => {
      const data: {
        artisans: unknown[]
        missions: unknown[]
      } = {
        artisans: [],
        missions: [],
      }

            // Search artisans
      if (type === 'all' || type === 'artisans') {
        data.artisans = await db.artisan.findMany({
          where: {
            OR: [
              { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
              { specialties: { contains: searchTerm, mode: 'insensitive' } },
              { skills: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
                country: true,
              },
            },
          },
          take: 20,
        })
      }

      // Search missions
      if (type === 'all' || type === 'missions') {
        data.missions = await db.mission.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm } },
              { description: { contains: searchTerm } },
            ],
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            artisan: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          take: 20,
        })
      }

      return data
    }, TTL.SEARCH)

    return NextResponse.json(results, {
      headers: {
        ...limiter.headers,
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
