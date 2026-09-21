import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const artisan = await db.artisan.findUnique({ where: { userId: session.user.id } })
    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan introuvable' }, { status: 404 })
    }

    const payments = await db.payment.findMany({
      where: { artisanId: artisan.id, status: 'completed' },
    })
    const totalRevenue = payments.reduce((sum, p) => sum + (p.netAmount ?? p.amount), 0)

    const missionsTermineesCount = await db.mission.count({
      where: { artisanId: artisan.id, status: { in: ['terminee', 'terminee_artisan'] } },
    })

    return NextResponse.json({
      totalRevenue,
      missionsCompleted: missionsTermineesCount,
      rating: artisan.rating,
      reviewCount: artisan.reviewCount,
    })
  } catch (error) {
    console.error('Erreur stats artisan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}