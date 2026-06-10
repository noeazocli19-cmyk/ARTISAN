import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'
import { cached, TTL, invalidateCachePrefix } from '@/lib/cache'

export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per 60 seconds
  const limiter = rateLimit(request, { limit: 100, window: 60 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer dans quelques secondes.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const skip = (page - 1) * limit

    // Build cache key based on query params
    const cacheKey = `artisans:${category || 'all'}:${location || 'all'}:${search || 'all'}:${page}:${limit}`

    const result = await cached(cacheKey, async () => {
      // Build where clause
      const where: Prisma.ArtisanWhereInput = {}

      if (category) {
        where.specialties = { contains: category }
      }

      if (location) {
        where.user = {
          location: { contains: location },
        }
      }

      if (search) {
        where.OR = [
          { user: { name: { contains: search } } },
          { specialties: { contains: search } },
          { skills: { contains: search } },
        ]
      }

      const [artisans, total] = await Promise.all([
        db.artisan.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
                country: true,
                email: true,
                phone: true,
                bio: true,
                isVerified: true,
              },
            },
          },
          orderBy: { rating: 'desc' },
          skip,
          take: limit,
        }),
        db.artisan.count({ where }),
      ])

      return { artisans, total, page, totalPages: Math.ceil(total / limit) }
    }, TTL.ARTISAN_LIST)

    return NextResponse.json(result, {
      headers: {
        ...limiter.headers,
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Get artisans error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des artisans' },
      { status: 500 }
    )
  }
}
