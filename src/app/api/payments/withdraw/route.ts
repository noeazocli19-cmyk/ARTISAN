import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { generateTransactionId, getActiveProvider } from '@/lib/payments'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/withdraw
 *
 * Creates a withdrawal request. The actual payout to the user's Mobile Money
 * account is performed via the provider's server-side API (to be wired up
 * with Kkiapay/CinetPay payout endpoints in production).
 *
 * Body:
 *   - amount: number (FCFA)
 *   - method: 'orange_money' | 'mtn_money' | 'wave' | 'moov_money'
 *   - phoneNumber: string
 */
export async function POST(request: NextRequest) {
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

    // ---- Parse & validate body ----
    const body = await request.json()
    const { amount, method, phoneNumber } = body

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: 'Le montant minimum de retrait est de 1 000 FCFA' },
        { status: 400 }
      )
    }

    const validMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money']
    if (!method || !validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Méthode de retrait invalide' },
        { status: 400 }
      )
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis' },
        { status: 400 }
      )
    }

    // ---- Check wallet balance ----
    const userPayments = await db.payment.findMany({
      where: { userId: payload.userId, status: 'completed' },
      select: { amount: true, netAmount: true, type: true, recipientId: true },
    })

    let totalReceived = 0
    let totalSpent = 0
    for (const p of userPayments) {
      const netValue = p.netAmount || p.amount
      if (p.type === 'deposit' || p.type === 'refund') totalReceived += netValue
      else if (p.type === 'withdrawal' || p.type === 'payment') totalSpent += netValue
      else if (p.type === 'transfer') {
        if (p.recipientId) totalSpent += netValue
        else totalReceived += netValue
      }
    }
    const balance = totalReceived - totalSpent

    if (amount > balance) {
      return NextResponse.json(
        { error: `Solde insuffisant. Solde disponible: ${balance.toLocaleString('fr-FR')} FCFA` },
        { status: 400 }
      )
    }

    // ---- Create withdrawal record ----
    const reference = generateTransactionId()

    const withdrawal = await db.payment.create({
      data: {
        userId: payload.userId,
        amount,
        netAmount: amount,
        commission: 0,
        currency: 'FCFA',
        type: 'withdrawal',
        method,
        status: 'pending',
        phoneNumber,
        reference,
        description: `Retrait vers ${method} (${phoneNumber})`,
        metadata: JSON.stringify({
          customerEmail: payload.email,
          provider: getActiveProvider(),
          requestedAt: new Date().toISOString(),
        }),
      },
    })

    // In demo mode, auto-complete immediately (setTimeout doesn't work in serverless)
    const provider = getActiveProvider()
    if (provider === 'demo') {
      await db.payment.update({
        where: { id: withdrawal.id },
        data: {
          status: 'completed',
          metadata: JSON.stringify({
            customerEmail: payload.email,
            provider: 'demo',
            completedAt: new Date().toISOString(),
          }),
        },
      })
    }

    return NextResponse.json({
      paymentId: withdrawal.id,
      reference,
      status: 'pending',
      provider,
      message: provider === 'demo'
        ? 'Retrait en cours de traitement (mode démo).'
        : 'Retrait enregistré. Vous recevrez les fonds sous 24-48h.',
      newBalance: balance - amount,
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du retrait' },
      { status: 500 }
    )
  }
}