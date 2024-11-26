import nodemailer from 'nodemailer'
import { EmailError } from './utils/api-error'

// Create reusable transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !port || !user || !pass) {
    throw new EmailError('Missing email configuration', {
      host: !host,
      port: !port,
      user: !user,
      pass: !pass
    })
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  })
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<void> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('Email configuration verified successfully')
  } catch (error) {
    console.error('Email configuration verification failed:', error)
    throw new EmailError('Failed to verify email configuration', error)
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = createTransporter()
    const fromEmail = process.env.SMTP_FROM_EMAIL
    const fromName = process.env.SMTP_FROM_NAME

    if (!fromEmail || !fromName) {
      throw new EmailError('Missing sender configuration', {
        fromEmail: !fromEmail,
        fromName: !fromName
      })
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      ...options
    })

    console.log('Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new EmailError('Failed to send email', error)
  }
}

interface VerificationEmailParams {
  email: string
  token: string
}

export async function sendVerificationEmail({ email, token }: VerificationEmailParams): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new EmailError('Missing APP_URL configuration')
  }

  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Maamul360!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new EmailError('Missing APP_URL configuration')
  }

  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #4B5563;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #6B7280; font-size: 14px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  })
}
