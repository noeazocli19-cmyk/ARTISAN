import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/verify-email
 * Body: { email, code }
 *
 * Vérifie le code et active le compte utilisateur.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code sont requis' },
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

    // Activer le compte utilisateur
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

    // Marquer le code comme utilisé
    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    console.log(`✅ Compte vérifié pour ${email}`)

    return NextResponse.json({
      message: 'Compte vérifié avec succès !',
      user,
      token,
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}