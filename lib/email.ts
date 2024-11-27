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

  // Create verification URL with token
  const verificationUrl = `${appUrl}/api/verify-email?token=${encodeURIComponent(token)}`

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #111827; margin-bottom: 10px;">Welcome to Maamul360!</h1>
        <p style="color: #4b5563; font-size: 16px;">Thank you for registering. Please verify your email address to get started.</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0070f3; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">
            Verify Email Address
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this URL into your browser:</p>
          <p style="color: #0070f3; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>This verification link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <div style="margin-top: 20px;">
          <p style="margin: 5px 0;">Best regards,</p>
          <p style="margin: 5px 0; font-weight: 500;">The Maamul360 Team</p>
        </div>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Verify your Maamul360 account',
    html: emailTemplate
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
