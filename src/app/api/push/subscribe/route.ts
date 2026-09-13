import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { subscription, ua } = body
    if (!subscription || !subscription.endpoint) return NextResponse.json({ error: 'subscription requis' }, { status: 400 })

    await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, ua: ua || null, userId: session.user.id },
      create: { endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, ua: ua || null, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('subscribe push error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    if (!endpoint) return NextResponse.json({ error: 'endpoint requis' }, { status: 400 })

    await db.pushSubscription.deleteMany({ where: { endpoint, userId: session.user.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('unsubscribe push error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
