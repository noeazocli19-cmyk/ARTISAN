import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Génère un code à 6 chiffres, l'envoie par email via Gmail,
 * et stocke le code en base de données (table PasswordResetToken).
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Pour des raisons de sécurité, on ne dit pas que l'email n'existe pas
      // (pour éviter que quelqu'un ne devine les emails enregistrés)
      return NextResponse.json(
        { message: 'Si cet email existe, un code a été envoyé.' },
        { status: 200 }
      )
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Le code expire dans 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Invalider les anciens codes pour cet email
    await db.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Stocker le nouveau code en base
    await db.passwordResetToken.create({
      data: {
        token: code,
        email,
        expiresAt,
      },
    })

    // Configurer le transporteur Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Envoyer l'email avec le code
    const mailOptions = {
      from: `"Artisan Connect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe - Artisan Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Artisan Connect</h1>
            <p style="color: white; opacity: 0.9;">Réinitialisation de mot de passe</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Bonjour ${user.name},</h2>
            <p style="color: #4b5563; font-size: 16px;">Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f59e0b; color: white; font-size: 36px; font-weight: bold; padding: 20px 40px; border-radius: 10px; letter-spacing: 10px;">
                ${code}
              </div>
            </div>
            <p style="color: #4b5563; font-size: 14px;">⏰ Ce code expire dans <strong>15 minutes</strong>.</p>
            <p style="color: #4b5563; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © 2025 Artisan Connect - La 1ère plateforme d'artisans en Afrique
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    console.log(`✅ Email envoyé à ${email} avec le code ${code}`)

    return NextResponse.json({
      message: 'Si cet email existe, un code a été envoyé.',
      // En développement seulement, on renvoie le code pour tester
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