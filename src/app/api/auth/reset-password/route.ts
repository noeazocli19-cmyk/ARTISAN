import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { rateLimitByPreset } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = rateLimitByPreset(request, 'auth')
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Ce lien de réinitialisation a déjà été utilisé' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    // Invalidate all other tokens for this email
    await db.passwordResetToken.updateMany({
      where: { email: resetToken.email, used: false },
      data: { used: true },
    })

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}
