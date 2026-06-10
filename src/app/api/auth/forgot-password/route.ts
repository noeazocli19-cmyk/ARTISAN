import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { sendEmail, getResetPasswordEmailHtml } from '@/lib/email'
import { rateLimitByPreset } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 3 requests per 60 seconds
  const limiter = rateLimitByPreset(request, 'auth')
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est requise' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.',
      })
    }

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate any existing tokens for this email
    await db.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Create new reset token
    await db.passwordResetToken.create({
      data: { token, email, expiresAt },
    })

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const resetUrl = `${baseUrl}/?reset_token=${token}`

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: '🔧 Artisan Connecté — Réinitialisation de votre mot de passe',
      html: getResetPasswordEmailHtml(resetUrl),
    })

    console.log(`📧 Password reset email sent to ${email}:`, emailResult.message)

    return NextResponse.json({
      message: 'Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.',
      // In development, include the reset URL for testing
      ...(process.env.NODE_ENV === 'development' && { devResetUrl: resetUrl }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre demande' },
      { status: 500 }
    )
  }
}
