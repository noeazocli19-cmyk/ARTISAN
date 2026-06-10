import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { cached, TTL } from '@/lib/cache'

export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per 60 seconds
  const limiter = rateLimit(request, { limit: 100, window: 60 })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    // Cache categories for 60 seconds (they rarely change)
    const categories = await cached('categories:all', async () => {
      return db.category.findMany({
        orderBy: { name: 'asc' },
      })
    }, TTL.CATEGORIES)

    return NextResponse.json({ categories }, {
      headers: {
        ...limiter.headers,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}
