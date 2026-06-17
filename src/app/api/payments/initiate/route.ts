import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import {
  initiateCinetPayPayment,
  verifyKkiapayTransaction,
  getChannelForMethod,
  isCinetPayConfigured,
  isKkiapayConfigured,
  isPaymentConfigured,
  calculateClientCommission,
  generateTransactionId,
  getKkiapayPublicKey,
  isKkiapaySandbox,
  getActiveProvider,
} from '@/lib/payments'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/initiate
 *
 * Initiates a payment. Supports Kkiapay (primary) and CinetPay (legacy).
 * In demo mode (no provider configured), payments auto-complete after 3s.
 *
 * Body:
 *   - amount: number (FCFA, minimum 500)
 *   - method: 'orange_money' | 'mtn_money' | 'wave' | 'moov_money' | 'card' | 'cash'
 *   - phoneNumber?: string (required for Mobile Money)
 *   - description?: string
 *   - recipientId?: string (for transfers to another user)
 *   - recipientName?: string
 *   - type?: 'payment' | 'deposit' | 'transfer' (default: 'payment')
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
    const {
      amount,
      method,
      phoneNumber,
      description,
      recipientId,
      recipientName,
      type = 'payment',
    } = body

    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: 'Le montant minimum est de 500 FCFA' },
        { status: 400 }
      )
    }

    const validMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money', 'airtel_money', 'm_pesa', 'card', 'cash']
    if (!method || !validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      )
    }

    const momoMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money', 'airtel_money', 'm_pesa']
    // Phone number is required for Mobile Money ONLY when using CinetPay (server-side flow).
    // For Kkiapay, the widget collects the phone number client-side.
    // For demo mode, phone is optional.
    if (momoMethods.includes(method) && !phoneNumber && isCinetPayConfigured() && !isKkiapayConfigured()) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis pour Mobile Money' },
        { status: 400 }
      )
    }

    // ---- Calculate commission (for deposits/transfers, client pays commission) ----
    const isDepositOrTransfer = type === 'deposit' || type === 'transfer'
    const commission = isDepositOrTransfer ? calculateClientCommission(amount) : null
    const totalToCharge = commission ? commission.totalToPay : amount
    const netAmount = commission ? commission.netAmount : amount

    // ---- Generate reference & create payment record ----
    const reference = generateTransactionId()

    const payment = await db.payment.create({
      data: {
        userId: payload.userId,
        amount: totalToCharge,
        netAmount,
        commission: commission?.commission || 0,
        currency: 'FCFA',
        type,
        method,
        status: 'pending',
        phoneNumber: phoneNumber || null,
        reference,
        description: description || (isDepositOrTransfer
          ? `Dépôt de ${amount.toLocaleString('fr-FR')} FCFA`
          : `Paiement ${reference}`),
        recipientId: recipientId || null,
        recipientName: recipientName || null,
        metadata: JSON.stringify({
          customerEmail: payload.email,
          originalAmount: amount,
          commission: commission?.commission || 0,
          provider: getActiveProvider(),
          initiatedAt: new Date().toISOString(),
        }),
      },
    })

    const provider = getActiveProvider()

    // ---- KKIAPAY flow (primary) ----
    if (provider === 'kkiapay' && method !== 'cash') {
      // Kkiapay uses a client-side widget.
      // Server just returns the public key + reference; the frontend opens the widget.
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'processing' },
      })

      return NextResponse.json({
        paymentId: payment.id,
        reference,
        status: 'processing',
        provider: 'kkiapay',
        kkiapay: {
          publicKey: getKkiapayPublicKey(),
          sandbox: isKkiapaySandbox(),
          amount: totalToCharge,
          callback: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payments/verify?reference=${reference}`,
        },
        commission: commission ? {
          originalAmount: commission.originalAmount,
          commission: commission.commission,
          totalToPay: commission.totalToPay,
        } : null,
        message: 'Paiement Kkiapay initié. Ouvrez le widget pour continuer.',
      })
    }

    // ---- CINETPAY flow (legacy) ----
    if (provider === 'cinetpay' && method !== 'cash') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const channel = getChannelForMethod(method)

      const cinetPayResult = await initiateCinetPayPayment({
        transactionId: reference,
        amount: totalToCharge,
        currency: 'XOF',
        description: description || `Paiement Artisan Connect - ${reference}`,
        customerName: payload.email.split('@')[0],
        customerEmail: payload.email,
        customerPhoneNumber: phoneNumber,
        channels: channel,
        returnUrl: `${baseUrl}/api/payments/verify?reference=${reference}`,
        notifyUrl: `${baseUrl}/api/payments/notify`,
        metadata: JSON.stringify({ paymentId: payment.id }),
      })

      if (cinetPayResult.code === '201' && cinetPayResult.data?.payment_url) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'processing',
            cinetPayTransId: cinetPayResult.data.payment_token,
            metadata: JSON.stringify({
              paymentId: payment.id,
              paymentUrl: cinetPayResult.data.payment_url,
              paymentToken: cinetPayResult.data.payment_token,
            }),
          },
        })

        return NextResponse.json({
          paymentId: payment.id,
          reference,
          status: 'processing',
          provider: 'cinetpay',
          paymentUrl: cinetPayResult.data.payment_url,
          message: 'Paiement initié. Redirection vers CinetPay...',
        })
      }

      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      return NextResponse.json(
        { error: 'Erreur lors de l\'initialisation du paiement. Veuillez réessayer.', reference },
        { status: 500 }
      )
    }

    // ---- Cash payment ----
    if (method === 'cash') {
      return NextResponse.json({
        paymentId: payment.id,
        reference,
        status: 'pending',
        provider: provider,
        message: 'Paiement en espèces enregistré. Veuillez payer à un point de service agréé.',
      })
    }

    // ---- DEMO mode (no provider configured) ----
    // Mark as completed immediately (setTimeout doesn't work in serverless)
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          completedAt: new Date().toISOString(),
          demoMode: true,
        }),
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      reference,
      status: 'completed',
      provider: 'demo',
      message: 'Paiement complété (mode démo).',
      demoMode: true,
      commission: commission ? {
        originalAmount: commission.originalAmount,
        commission: commission.commission,
        totalToPay: commission.totalToPay,
      } : null,
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du paiement' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/initiate
 * Returns the current payment provider configuration (for frontend).
 */
export async function GET() {
  return NextResponse.json({
    provider: getActiveProvider(),
    configured: isPaymentConfigured(),
    kkiapay: {
      configured: isKkiapayConfigured(),
      sandbox: isKkiapaySandbox(),
      publicKey: getKkiapayPublicKey(),
    },
    cinetpay: {
      configured: isCinetPayConfigured(),
    },
  })
}