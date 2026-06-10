import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyCinetPayPayment, isCinetPayConfigured } from '@/lib/payments'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    // Find payment by reference
    const payment = await db.payment.findUnique({
      where: { reference },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    // If CinetPay is configured, verify with provider
    if (isCinetPayConfigured() && payment.cinetPayTransId) {
      const verification = await verifyCinetPayPayment(reference)

      if (verification.success) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            metadata: JSON.stringify({
              ...JSON.parse(payment.metadata || '{}'),
              verifiedAt: new Date().toISOString(),
              paymentMethod: verification.method,
            }),
          },
        })
      } else if (verification.status === 'refused' || verification.status === 'cancelled') {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' },
        })
      }

      // Redirect back to app
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '/'
      return NextResponse.redirect(new URL(`/?payment=${verification.success ? 'success' : 'failed'}&ref=${reference}`, baseUrl))
    }

    // Demo mode: return current status
    return NextResponse.json({
      paymentId: payment.id,
      reference: payment.reference,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      createdAt: payment.createdAt,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
