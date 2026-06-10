import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * CinetPay webhook notification endpoint
 * This is called by CinetPay when a payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id, status, payment_method, metadata } = body

    if (!transaction_id) {
      return NextResponse.json({ error: 'Transaction ID manquant' }, { status: 400 })
    }

    // Find the payment by reference
    const payment = await db.payment.findUnique({
      where: { reference: transaction_id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    // Update payment status based on CinetPay notification
    const statusMap: Record<string, string> = {
      ACCEPTED: 'completed',
      REFUSED: 'failed',
      CANCELLED: 'failed',
      PENDING: 'pending',
      WAITING: 'processing',
    }

    const newStatus = statusMap[status] || 'pending'

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          cinetPayNotification: body,
          notifiedAt: new Date().toISOString(),
          paymentMethod: payment_method,
        }),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Payment notification error:', error)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }
}
