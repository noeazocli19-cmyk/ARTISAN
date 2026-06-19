import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/register
 * Body: { name, email, password, role, phone?, location?, country? }
 *
 * Crée un utilisateur NON vérifié et envoie un code à 6 chiffres par email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'client', phone, location, country } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur (non vérifié)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
        location: location || null,
        country: country || null,
        emailVerified: false,
      },
    })

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    // Invalider les anciens codes
    await db.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Stocker le code (réutilise la table PasswordResetToken)
    await db.passwordResetToken.create({
      data: {
        token: code,
        email,
        expiresAt,
      },
    })

    // Envoyer l'email avec le code
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

    const mailOptions = {
      from: `"Artisan Connect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Vérifiez votre compte - Artisan Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Bienvenue sur Artisan Connect ! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2>Bonjour ${name},</h2>
            <p>Merci de vous être inscrit sur Artisan Connect. Pour activer votre compte, veuillez utiliser ce code de vérification :</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f59e0b; color: white; font-size: 36px; font-weight: bold; padding: 20px 40px; border-radius: 10px; letter-spacing: 10px;">
                ${code}
              </div>
            </div>
            <p>⏰ Ce code expire dans <strong>15 minutes</strong>.</p>
            <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © 2025 Artisan Connect - La 1ère plateforme d'artisans en Afrique
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email de vérification envoyé à ${email} avec le code ${code}`)

    return NextResponse.json({
      message: 'Compte créé ! Vérifiez votre email pour activer votre compte.',
      userId: user.id,
      email,
      needVerification: true,
      // En développement seulement
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}