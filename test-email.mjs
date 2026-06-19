import nodemailer from 'nodemailer'

async function testEmail() {
  try {
    console.log('📧 Test d\'envoi d\'email...')
    console.log('SMTP_USER:', process.env.SMTP_USER || '(non défini)')
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ défini' : '❌ non défini')

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

    console.log('⏳ Envoi en cours...')

    const info = await transporter.sendMail({
      from: `"Test Artisan" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: '✅ Test Email - Artisan Connect',
      text: 'Si tu reçois cet email, la configuration SMTP marche !',
      html: '<h1>✅ Test réussi !</h1><p>La configuration SMTP de Artisan Connect marche correctement.</p>',
    })

    console.log('✅ EMAIL ENVOYÉ !')
    console.log('📋 Message ID:', info.messageId)
    console.log('📋 Réponse:', info.response)
  } catch (error) {
    console.error('❌ ERREUR:', error.message)
    console.error('📋 Code:', error.code)
    console.error('📋 Détails:', error.response || error.stack)
  }
}

testEmail()