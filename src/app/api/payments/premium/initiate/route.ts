import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'
import {
  generateTransactionId,
  getKkiapayPublicKey,
  isKkiapaySandbox,
  isKkiapayConfigured,
  getActiveProvider,
} from '@/lib/payments'
import { initiateFeexPayPayment, isFeexPayConfigured, isFeexPaySandbox } from '@/lib/feexpay'

export const dynamic = 'force-dynamic'

const PREMIUM_PRICE_FCFA = 5000

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const artisan = await db.artisan.findUnique({ where: { userId: session.user.id } })
    if (!artisan) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 })
    }

    const reference = generateTransactionId()

    const payment = await db.payment.create({
      data: {
        amount: PREMIUM_PRICE_FCFA,
        netAmount: PREMIUM_PRICE_FCFA,
        commission: 0,
        currency: 'XAF',
        status: 'en_attente',
        type: 'premium_subscription',
        description: 'Abonnement Artisan Vérifié - 30 jours',
        reference,
        clientId: session.user.id,
        artisanId: artisan.id,
      },
    })

    const provider = getActiveProvider()
    if (provider === 'feexpay') {
      if (!isFeexPayConfigured()) {
        return NextResponse.json({ error: 'FeexPay n’est pas configuré' }, { status: 503 })
      }
      const body = await request.json().catch(() => ({}))
      const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
      const network = body.network === 'mtn' ? 'mtn' : body.network === 'moov' ? 'moov' : ''
      if (!phoneNumber || !network) {
        return NextResponse.json({ error: 'Téléphone et réseau Mobile Money requis' }, { status: 400 })
      }
      try {
        const result = await initiateFeexPayPayment({
          network,
          phoneNumber,
          amount: PREMIUM_PRICE_FCFA,
          description: 'Abonnement Artisan Vérifié Finda - 30 jours',
        })
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'processing',
            phoneNumber,
            method: network === 'mtn' ? 'mtn_money' : 'moov_money',
            metadata: JSON.stringify({ provider: 'feexpay', feexpayReference: result.reference, feexpayTransref: result.transref, feexpaySandbox: isFeexPaySandbox() }),
          },
        })
        return NextResponse.json({ paymentId: payment.id, reference, amount: PREMIUM_PRICE_FCFA, provider: 'feexpay' })
      } catch (error) {
        await db.payment.update({ where: { id: payment.id }, data: { status: 'failed' } })
        throw error
      }
    }

    return NextResponse.json({
      paymentId: payment.id,
      reference,
      amount: PREMIUM_PRICE_FCFA,
      provider,
      kkiapayPublicKey: isKkiapayConfigured() ? getKkiapayPublicKey() : null,
      sandbox: isKkiapaySandbox(),
      demoMode: !isKkiapayConfigured(),
    })
  } catch (error) {
    console.error('Erreur initiation paiement premium:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
