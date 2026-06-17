import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'
import { cached, TTL, invalidateCachePrefix } from '@/lib/cache'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Rate limiting for creating missions: 20 per 60 seconds
  const limiter = rateLimit(request, { limit: 20, window: 60 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer.' },
      { status: 429, headers: limiter.headers }
    )
  }

  // Auth: extract user from JWT instead of trusting body.clientId
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, category, budget, location } = body

    // Use authenticated user's ID as the mission client
    const clientId = payload.userId

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Titre, description et catégorie sont requis' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await db.user.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    const mission = await db.mission.create({
      data: {
        title,
        description,
        category,
        budget: budget || null,
        location: location || null,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
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
    })

    // Invalidate mission caches
    invalidateCachePrefix('missions:')
    invalidateCachePrefix('search:')

    return NextResponse.json({ mission }, { status: 201 })
  } catch (error) {
    console.error('Create mission error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la mission' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting: 100 per 60 seconds
  const limiter = rateLimit(request, { limit: 100, window: 60 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const artisanId = searchParams.get('artisanId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const cacheKey = `missions:${clientId || 'all'}:${artisanId || 'all'}:${status || 'all'}:${page}:${limit}`

    const result = await cached(cacheKey, async () => {
      const where: Prisma.MissionWhereInput = {}

      if (clientId) {
        where.clientId = clientId
      }

      if (artisanId) {
        where.artisanId = artisanId
      }

      if (status) {
        where.status = status
      }

      const [missions, total] = await Promise.all([
        db.mission.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
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
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.mission.count({ where }),
      ])

      return { missions, total, page, totalPages: Math.ceil(total / limit) }
    }, TTL.ARTISAN_LIST)

    return NextResponse.json(result, {
      headers: {
        ...limiter.headers,
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Get missions error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des missions' },
      { status: 500 }
    )
  }
}