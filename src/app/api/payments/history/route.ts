import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/history
 *
 * Returns the authenticated user's payment history with summary.
 *
 * Query params:
 *   - type?: 'payment' | 'deposit' | 'withdrawal' | 'transfer' | 'refund'
 *   - method?: PaymentMethod
 *   - status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
 *   - search?: string (matches description, reference, recipientName)
 *   - dateFrom?: ISO date string
 *   - dateTo?: ISO date string
 *   - limit?: number (default 50, max 200)
 *   - offset?: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // ---- Auth ----
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // ---- Parse query params ----
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const method = searchParams.get('method') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
    const offset = Number(searchParams.get('offset') || 0)

    // ---- Build where clause ----
    const where: Record<string, unknown> = {
      userId: payload.userId,
    }

    if (type) where.type = type
    if (method) where.method = method
    if (status) where.status = status

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { reference: { contains: search } },
        { recipientName: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {}
      if (dateFrom) createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        createdAt.lte = to
      }
      where.createdAt = createdAt
    }

    // ---- Fetch payments ----
    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.payment.count({ where }),
    ])

    // ---- Compute summary / wallet balance ----
    // Balance = sum of completed deposits/transfers received - sum of completed payments/withdrawals/transfers sent
    const allUserPayments = await db.payment.findMany({
      where: {
        userId: payload.userId,
        status: 'completed',
      },
      select: { amount: true, netAmount: true, type: true, recipientId: true },
    })

    let totalReceived = 0
    let totalSpent = 0
    let totalDeposited = 0
    let totalWithdrawn = 0

    for (const p of allUserPayments) {
      const netValue = p.netAmount || p.amount
      if (p.type === 'deposit') {
        totalDeposited += netValue
        totalReceived += netValue
      } else if (p.type === 'withdrawal') {
        totalWithdrawn += netValue
        totalSpent += netValue
      } else if (p.type === 'transfer') {
        if (p.recipientId) {
          // outgoing transfer
          totalSpent += netValue
        } else {
          totalReceived += netValue
        }
      } else if (p.type === 'payment') {
        totalSpent += netValue
      } else if (p.type === 'refund') {
        totalReceived += netValue
      }
    }

    const balance = totalReceived - totalSpent

    return NextResponse.json({
      payments,
      summary: {
        balance,
        totalReceived,
        totalSpent,
        totalDeposited,
        totalWithdrawn,
        transactionCount: total,
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payments.length < total,
      },
    })
  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}