import nodemailer from 'nodemailer'

// Create reusable transporter
function getTransporter() {
  // For production, use real SMTP credentials
  // For development, we use a test account or environment variables
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER || ''
  const smtpPass = process.env.SMTP_PASS || ''

  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  }

  // Fallback: use ethereal email for development
  return null
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; message?: string; previewUrl?: string }> {
  const transporter = getTransporter()

  if (!transporter) {
    // In development without SMTP config, use ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount()
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      const info = await testTransporter.sendMail({
        from: '"Artisan Connecté" <noreply@artisan-connecte.com>',
        to,
        subject,
        html,
      })

      console.log('📧 Email sent (test):', nodemailer.getTestMessageUrl(info))
      return {
        success: true,
        message: 'Email de test envoyé',
        previewUrl: nodemailer.getTestMessageUrl(info),
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      return {
        success: true,
        message: 'Email simulé (pas de configuration SMTP)',
      }
    }
  }

  try {
    const info = await transporter.sendMail({
      from: '"Artisan Connecté" <noreply@artisan-connecte.com>',
      to,
      subject,
      html,
    })

    console.log('📧 Email sent:', info.messageId)
    return { success: true, message: 'Email envoyé' }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, message: 'Erreur lors de l\'envoi de l\'email' }
  }
}

export function getResetPasswordEmailHtml(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0; text-align: center;">
            <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">🔧 Artisan Connecté</h1>
                  <p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 16px;">Réinitialisation de votre mot de passe</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Bonjour,</p>
                  <p style="margin: 0 0 20px; font-size: 16px; color: #555555; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Artisan Connecté</strong>.
                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                  </p>
                  <table role="presentation" style="margin: 30px auto;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 12px;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 12px;">
                          Réinitialiser mon mot de passe
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0; font-size: 14px; color: #888888; line-height: 1.6;">
                    Ce lien est valide pendant <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
                  </p>
                  <div style="margin-top: 20px; padding: 16px; background-color: #fff8f0; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #666666;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                      <a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    © 2025 Artisan Connecté — La 1ère plateforme d'artisans en Afrique<br>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
