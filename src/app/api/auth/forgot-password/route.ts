import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Email sender address - configurable via environment
// Use your verified domain from Resend Dashboard
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

// Resend client - only initialized if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { message: 'Si cet email existe, un code a été envoyé.' },
        { status: 200 }
      )
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Invalider les anciens codes
    await db.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Stocker le nouveau code
    await db.passwordResetToken.create({
      data: { token: code, email, expiresAt },
    })

    // Envoyer l'email via Resend (si configuré)
    if (!resend) {
      console.warn("⚠️ RESEND_API_KEY not set - password reset email not sent")
      console.warn(`📧 Reset code for ${email}: ${code}`)
      // Return success anyway for development (code is logged above)
      return NextResponse.json({
        message: 'Si cet email existe, un code a été envoyé.',
        ...(process.env.NODE_ENV === 'development' && { devCode: code }),
      })
    }

    await resend.emails.send({
      from: `Artisan Connect <${EMAIL_FROM}>`,
      to: email,
      subject: 'Votre code de réinitialisation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Artisan Connect</h2>
          <p>Bonjour ${user.name},</p>
          <p>Voici votre code de réinitialisation de mot de passe :</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f59e0b;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Ce code expire dans <strong>15 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `,
    })

    return NextResponse.json({
      message: 'Si cet email existe, un code a été envoyé.',
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}