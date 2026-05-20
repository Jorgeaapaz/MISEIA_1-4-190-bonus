import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1027'),
  secure: false,
  ignoreTLS: true,
})

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const magicUrl = `${baseUrl}/auth/verify?token=${token}`

  await transporter.sendMail({
    from: '"BondVault" <noreply@bondvault.io>',
    to: email,
    subject: 'Tu enlace de acceso a BondVault',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #f59e0b; font-size: 28px; margin-bottom: 8px;">BondVault</h1>
        <p style="color: #a3a3a3; margin-bottom: 32px;">Gestión de Deuda Corporativa</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Tu enlace de acceso</h2>
        <p style="color: #d4d4d4; margin-bottom: 24px;">Haz clic en el siguiente botón para acceder a tu cuenta. Este enlace expirará en 15 minutos.</p>
        <a href="${magicUrl}" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Acceder a BondVault
        </a>
        <p style="color: #737373; margin-top: 32px; font-size: 14px;">Si no solicitaste este enlace, puedes ignorar este mensaje.</p>
      </div>
    `,
  })
}
