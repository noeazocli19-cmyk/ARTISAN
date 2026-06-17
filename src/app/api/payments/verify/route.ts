import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyCinetPayPayment,
  verifyKkiapayTransaction,
  isCinetPayConfigured,
  isKkiapayConfigured,
} from '@/lib/payments'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/verify?reference=...&transactionId=...
 *
 * Verifies a payment with the active provider and updates its status.
 * - For Kkiapay: pass transactionId (returned by the widget success callback)
 * - For CinetPay: the reference is used to verify via the CinetPay API
 *
 * Returns JSON or redirects to /?payment=success|failed&ref=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const transactionId = searchParams.get('transactionId') // Kkiapay transaction ID
    const redirect = searchParams.get('redirect') !== 'false'

    if (!reference) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { reference },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    let success = false
    let newStatus: string = payment.status
    let metadata: Record<string, unknown> = {}

    try {
      metadata = JSON.parse(payment.metadata || '{}')
    } catch {
      metadata = {}
    }

    // ---- Kkiapay verification ----
    if (isKkiapayConfigured() && transactionId) {
      const verification = await verifyKkiapayTransaction(transactionId)

      if (verification.success) {
        success = true
        newStatus = 'completed'
        metadata.kkiapayTransactionId = transactionId
        metadata.verifiedAt = new Date().toISOString()
        metadata.kkiapayPayload = verification.payload
      } else if (verification.status === 'failed') {
        newStatus = 'failed'
        metadata.kkiapayTransactionId = transactionId
        metadata.failedAt = new Date().toISOString()
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          kkiapayTransactionId: transactionId,
          metadata: JSON.stringify(metadata),
        },
      })
    }
    // ---- CinetPay verification ----
    else if (isCinetPayConfigured() && payment.cinetPayTransId) {
      const verification = await verifyCinetPayPayment(reference)

      if (verification.success) {
        success = true
        newStatus = 'completed'
        metadata.verifiedAt = new Date().toISOString()
        metadata.paymentMethod = verification.method
      } else if (verification.status === 'refused' || verification.status === 'cancelled') {
        newStatus = 'failed'
        metadata.failedAt = new Date().toISOString()
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          metadata: JSON.stringify(metadata),
        },
      })
    }
    // ---- Demo mode: return current status ----
    else {
      return NextResponse.json({
        paymentId: payment.id,
        reference: payment.reference,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt,
      })
    }

    // ---- Response ----
    if (redirect) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '/'
      return NextResponse.redirect(
        new URL(`/?payment=${success ? 'success' : 'failed'}&ref=${reference}`, baseUrl)
      )
    }

    return NextResponse.json({
      paymentId: payment.id,
      reference: payment.reference,
      status: newStatus,
      success,
      amount: payment.amount,
      method: payment.method,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}

/**
 * POST /api/payments/verify
 * Alternative entry point for frontend to verify a payment (no redirect).
 * Body: { reference: string, transactionId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, transactionId } = body

    if (!reference) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { reference },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    let success = false
    let newStatus: string = payment.status
    let metadata: Record<string, unknown> = {}

    try {
      metadata = JSON.parse(payment.metadata || '{}')
    } catch {
      metadata = {}
    }

    // ---- Kkiapay verification ----
    if (isKkiapayConfigured() && transactionId) {
      const verification = await verifyKkiapayTransaction(transactionId)

      if (verification.success) {
        success = true
        newStatus = 'completed'
        metadata.kkiapayTransactionId = transactionId
        metadata.verifiedAt = new Date().toISOString()
      } else if (verification.status === 'failed') {
        newStatus = 'failed'
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          kkiapayTransactionId: transactionId,
          metadata: JSON.stringify(metadata),
        },
      })
    } else {
      success = payment.status === 'completed'
    }

    return NextResponse.json({
      paymentId: payment.id,
      reference: payment.reference,
      status: newStatus,
      success,
      amount: payment.amount,
      method: payment.method,
    })
  } catch (error) {
    console.error('Payment verification (POST) error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}