import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'
import { hashPassword } from 'better-auth/crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/reset-password
 * Body: { email: string, code: string, newPassword: string }
 *
 * Vérifie le code et met à jour le mot de passe.
 * Uses Better Auth's password hashing for compatibility.
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

    // Hasher le nouveau mot de passe avec Better Auth's password hashing
    // This ensures compatibility with Better Auth's password verification
    const hashedPassword = await hashPassword(newPassword)

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

    // Invalider toutes les sessions existantes pour cet utilisateur (security best practice)
    const user = await db.user.findUnique({ where: { email } })
    if (user) {
      await db.session.deleteMany({ where: { userId: user.id } })
    }

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