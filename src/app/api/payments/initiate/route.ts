import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import {
  initiateCinetPayPayment,
  getChannelForMethod,
  isCinetPayConfigured,
  generateTransactionId,
} from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, method, phoneNumber, description, recipientId, recipientName } = body

    // Validation
    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: 'Le montant minimum est de 500 FCFA' },
        { status: 400 }
      )
    }

    if (!method) {
      return NextResponse.json(
        { error: 'La méthode de paiement est requise' },
        { status: 400 }
      )
    }

    const validMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money', 'airtel_money', 'm_pesa', 'card', 'cash']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      )
    }

    // Phone number required for Mobile Money
    const momoMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money', 'airtel_money', 'm_pesa']
    if (momoMethods.includes(method) && !phoneNumber) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis pour Mobile Money' },
        { status: 400 }
      )
    }

    // Generate transaction reference
    const reference = generateTransactionId()

    // Create payment record in database
    const payment = await db.payment.create({
      data: {
        userId: payload.userId,
        amount,
        currency: 'FCFA',
        method,
        status: 'pending',
        phoneNumber: phoneNumber || null,
        reference,
        description: description || null,
        recipientId: recipientId || null,
        recipientName: recipientName || null,
        metadata: JSON.stringify({ customerEmail: payload.email }),
      },
    })

    // If CinetPay is configured, initiate real payment
    if (isCinetPayConfigured() && method !== 'cash') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const channel = getChannelForMethod(method)

      const cinetPayResult = await initiateCinetPayPayment({
        transactionId: reference,
        amount,
        currency: 'XOF', // FCFA = XOF in ISO 4217
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
        // Update payment with CinetPay info
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
          paymentUrl: cinetPayResult.data.payment_url,
          message: 'Paiement initié. Redirection vers le fournisseur de paiement...',
        })
      }

      // CinetPay failed to initiate
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      return NextResponse.json(
        { error: 'Erreur lors de l\'initialisation du paiement. Veuillez réessayer.', reference },
        { status: 500 }
      )
    }

    // Demo mode (no CinetPay configured) or cash payment
    if (method === 'cash') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'pending' },
      })

      return NextResponse.json({
        paymentId: payment.id,
        reference,
        status: 'pending',
        message: 'Paiement en espèces enregistré. Veuillez payer à un point de service agréé.',
      })
    }

    // Demo simulation for Mobile Money / Card
    await db.payment.update({
      where: { id: payment.id },
      data: { status: 'processing' },
    })

    // Simulate processing and auto-complete after delay
    setTimeout(async () => {
      try {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'completed' },
        })
      } catch {
        // ignore
      }
    }, 3000)

    return NextResponse.json({
      paymentId: payment.id,
      reference,
      status: 'processing',
      message: 'Paiement en cours de traitement. Vous recevrez une confirmation sous peu.',
      demoMode: !isCinetPayConfigured(),
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du paiement' },
      { status: 500 }
    )
  }
}
