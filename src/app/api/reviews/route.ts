import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('authorId')
    const artisanId = searchParams.get('artisanId')
    const missionId = searchParams.get('missionId')

    const where: Record<string, string> = {}
    if (authorId) where.authorId = authorId
    if (artisanId) where.artisanId = artisanId
    if (missionId) where.missionId = missionId

    const reviews = await db.review.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        mission: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment, authorId, artisanId, missionId } = body

    // Validation
    if (!rating || !comment || !authorId || !artisanId || !missionId) {
      return NextResponse.json(
        { error: 'Note, commentaire, authorId, artisanId et missionId sont requis' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    // Check if review already exists for this mission
    const existingReview = await db.review.findUnique({
      where: { missionId },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Un avis existe déjà pour cette mission' },
        { status: 409 }
      )
    }

    // Create review
    const review = await db.review.create({
      data: {
        rating,
        comment,
        authorId,
        artisanId,
        missionId,
      },
      include: {
        author: {
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
              },
            },
          },
        },
        mission: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Update artisan rating and review count
    const artisanReviews = await db.review.findMany({
      where: { artisanId },
      select: { rating: true },
    })

    const totalRating = artisanReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / artisanReviews.length

    await db.artisan.update({
      where: { id: artisanId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: artisanReviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'avis' },
      { status: 500 }
    )
  }
}
