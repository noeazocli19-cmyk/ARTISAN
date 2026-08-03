import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/lib/db"
import { Resend } from "resend"

// Email sender address - configurable via environment
// Use your verified domain from Resend Dashboard
// Example: "noreply@artisan-connecte.com"
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"

// Resend client - only initialized if API key is available
// In development without API key, password reset emails won't be sent
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn("⚠️ RESEND_API_KEY not set - password reset email not sent")
        console.warn(`📧 Reset URL for ${user.email}: ${url}`)
        return
      }
      await resend.emails.send({
        from: `Artisan Connect <${EMAIL_FROM}>`,
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Artisan Connect</h2>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <a href="${url}" style="background: linear-gradient(to right, #f59e0b, #ea580c); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
              Réinitialiser mon mot de passe
            </a>
            <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure.</p>
          </div>
        `,
      })
    },
    resetPasswordTokenExpiresIn: 3600,
  },

  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null,
  ].filter(Boolean) as string[],

  plugins: [nextCookies()],
})