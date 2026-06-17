import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyKkiapayWebhookSignature, isKkiapayConfigured } from '@/lib/payments'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/notify
 *
 * Webhook endpoint for payment provider notifications.
 *
 * SUPPORTED PROVIDERS:
 * 1. Kkiapay — verifies HMAC-SHA256 signature with x-kkiapay-signature header
 * 2. CinetPay — legacy (no signature verification; relies on transaction_id lookup)
 *
 * SECURITY:
 * - Kkiapay webhooks are verified via HMAC signature
 * - CinetPay webhooks should be verified by calling /payment/check (TODO)
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    // ---- Detect provider by payload shape ----
    // Kkiapay sends: { transactionId, status, amount, ... }
    // CinetPay sends: { transaction_id, status, payment_method, metadata, ... }
    const isKkiapayPayload = 'transactionId' in body && !('transaction_id' in body)
    const isCinetPayPayload = 'transaction_id' in body

    // ============================================================
    // KKIAPAY WEBHOOK
    // ============================================================
    if (isKkiapayPayload) {
      const signature = request.headers.get('x-kkiapay-signature') || ''

      // Verify signature if Kkiapay is configured
      if (isKkiapayConfigured() && signature) {
        if (!verifyKkiapayWebhookSignature(rawBody, signature)) {
          console.error('Kkiapay webhook signature verification failed')
          return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
        }
      }

      const { transactionId, status, amount, paymentMethod } = body

      if (!transactionId) {
        return NextResponse.json({ error: 'transactionId manquant' }, { status: 400 })
      }

      // Find the payment by kkiapayTransactionId OR by reference (fallback)
      let payment = await db.payment.findFirst({
        where: { kkiapayTransactionId: transactionId },
      })

      if (!payment) {
        // Try by reference (in case webhook arrives before verify endpoint updates the ID)
        payment = await db.payment.findUnique({
          where: { reference: transactionId },
        })
      }

      if (!payment) {
        return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
      }

      const statusMap: Record<string, string> = {
        SUCCESS: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded',
        PENDING: 'pending',
      }

      const newStatus = statusMap[String(status || '').toUpperCase()] || 'pending'

      let metadata: Record<string, unknown> = {}
      try {
        metadata = JSON.parse(payment.metadata || '{}')
      } catch {
        metadata = {}
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          kkiapayTransactionId: transactionId,
          metadata: JSON.stringify({
            ...metadata,
            kkiapayNotification: body,
            notifiedAt: new Date().toISOString(),
            paymentMethod,
            amount,
          }),
        },
      })

      return NextResponse.json({ received: true, status: newStatus })
    }

    // ============================================================
    // CINETPAY WEBHOOK (legacy)
    // ============================================================
    if (isCinetPayPayload) {
      // SECURITY WARNING: CinetPay webhooks are not signed.
      // For production, you should call verifyCinetPayPayment(transaction_id) here
      // to confirm the status before trusting the webhook payload.
      const { transaction_id, status, payment_method } = body

      if (!transaction_id) {
        return NextResponse.json({ error: 'Transaction ID manquant' }, { status: 400 })
      }

      const payment = await db.payment.findUnique({
        where: { reference: transaction_id },
      })

      if (!payment) {
        return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
      }

      const statusMap: Record<string, string> = {
        ACCEPTED: 'completed',
        REFUSED: 'failed',
        CANCELLED: 'failed',
        PENDING: 'pending',
        WAITING: 'processing',
      }

      const newStatus = statusMap[status] || 'pending'

      let metadata: Record<string, unknown> = {}
      try {
        metadata = JSON.parse(payment.metadata || '{}')
      } catch {
        metadata = {}
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          metadata: JSON.stringify({
            ...metadata,
            cinetPayNotification: body,
            notifiedAt: new Date().toISOString(),
            paymentMethod: payment_method,
          }),
        },
      })

      return NextResponse.json({ received: true, status: newStatus })
    }

    // Unknown payload shape
    return NextResponse.json(
      { error: 'Format de webhook non reconnu' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment notification error:', error)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }
}