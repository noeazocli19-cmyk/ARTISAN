import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/initialize
 * Legacy route — maintenant utilise Kkiapay au lieu de CinetPay
 */
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json({ error: 'Base de données non disponible' }, { status: 503 })

    const { verifyToken } = await import('@/lib/auth')
    const { isKkiapayConfigured, generateTransactionId, calculateClientCommission } = await import('@/lib/payments')

    if (!isKkiapayConfigured()) {
      return NextResponse.json({ error: 'Paiement non configuré' }, { status: 503 })
    }

    const body = await request.json()
    const { amount, method, phoneNumber } = body

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    let userId = body.userId

    if (token) {
      const payload = verifyToken(token)
      if (payload) userId = payload.userId
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    if (!amount || !method) {
      return NextResponse.json({ error: 'Montant et méthode requis' }, { status: 400 })
    }

    // Calcul commission
    const commission = calculateClientCommission(amount)
    const reference = generateTransactionId()

    // Créer paiement
    const payment = await db.payment.create({
      data: {
        userId,
        amount: commission.totalToPay,
        commission: commission.commission,
        netAmount: amount,
        currency: 'FCFA',
        type: 'deposit',
        method,
        status: 'pending',
        reference,
        phoneNumber: phoneNumber || null,
        description: `Dépôt de ${amount.toLocaleString('fr-FR')} FCFA`,
        metadata: JSON.stringify({
          originalAmount: amount,
          clientCommission: commission.commission,
          initiatedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: payment.id,
        reference: payment.reference,
        amount: commission.totalToPay,
        originalAmount: amount,
        commission: commission.commission,
        currency: 'FCFA',
        status: 'pending',
        apiKey: process.env.KKIAPAY_API_KEY,
      },
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'initialisation du paiement' }, { status: 500 })
  }
}
