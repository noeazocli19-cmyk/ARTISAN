
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code sont requis' },
        { status: 400 }
      )
    }

    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        email,
        token: code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Code invalide ou expire' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { email },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        location: true,
        country: true,
        bio: true,
        isVerified: true,
        emailVerified: true,
      },
    })

    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    console.log('Compte verifie pour ' + email)

    return NextResponse.json({
      message: 'Compte verifie avec succes !',
      user,
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la verification' },
      { status: 500 }
    )
  }
}
