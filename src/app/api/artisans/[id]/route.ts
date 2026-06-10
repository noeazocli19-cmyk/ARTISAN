import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const artisan = await db.artisan.findUnique({
      where: { id },
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
            createdAt: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        missions: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!artisan) {
      return NextResponse.json(
        { error: 'Artisan non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ artisan })
  } catch (error) {
    console.error('Get artisan error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'artisan' },
      { status: 500 }
    )
  }
}
