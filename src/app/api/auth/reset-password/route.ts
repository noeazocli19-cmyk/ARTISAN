import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/reset-password
 * Body: { email: string, code: string, newPassword: string }
 *
 * Vérifie le code et met à jour le mot de passe.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    // Validation
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code et nouveau mot de passe sont requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Trouver le code en base
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
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Marquer le code comme utilisé
    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    console.log(`✅ Mot de passe réinitialisé pour ${email}`)

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    )
  }
}