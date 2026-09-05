import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'
import {
  generateTransactionId,
  getKkiapayPublicKey,
  isKkiapaySandbox,
  isKkiapayConfigured,
} from '@/lib/payments'

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

    return NextResponse.json({
      paymentId: payment.id,
      reference,
      amount: PREMIUM_PRICE_FCFA,
      kkiapayPublicKey: isKkiapayConfigured() ? getKkiapayPublicKey() : null,
      sandbox: isKkiapaySandbox(),
      demoMode: !isKkiapayConfigured(),
    })
  } catch (error) {
    console.error('Erreur initiation paiement premium:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
