import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const app = new Hono()

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  subdomain: z.string().min(4, 'Invalid subdomain'),
})

app.post('/api/auth/forgot-password', async (c) => {
  try {
    // Check content type
    const contentType = c.req.header('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return c.json(
        { success: false, error: 'Content-Type must be application/json' },
        400
      )
    }

    // Safely parse JSON
    let body
    try {
      body = await c.req.json()
    } catch (e) {
      console.error('JSON parse error:', e)
      return c.json(
        { success: false, error: 'Invalid JSON in request body' },
        400
      )
    }

    if (!body || Object.keys(body).length === 0) {
      return c.json(
        { success: false, error: 'Request body cannot be empty' },
        400
      )
    }

    console.log('Received forgot password request:', body)

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Find tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        subdomain: validatedData.subdomain,
      },
    })

    if (!tenant) {
      return c.json(
        { success: false, error: 'Invalid tenant' },
        400
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        tenantId: tenant.id,
      },
    })

    if (!user) {
      return c.json(
        { success: false, error: 'No account found with this email' },
        400
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // Send reset email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        token: resetToken,
      })

      return c.json({
        success: true,
        message: 'Password reset instructions sent to your email',
      })
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      
      // Revert token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      })

      return c.json(
        { success: false, error: 'Failed to send reset email. Please try again.' },
        500
      )
    }
  } catch (error) {
    console.error('Forgot password error:', error)

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      )
    }

    // Handle Prisma errors
    if (error.code) {
      switch (error.code) {
        case 'P2025':
          return c.json(
            { success: false, error: 'User not found. Please check your email address.' },
            404
          )
        case 'P2003':
          return c.json(
            { success: false, error: 'Database error. Please try again.' },
            500
          )
      }
    }

    // Handle email errors
    if (error.message?.includes('SMTP') || error.message?.includes('email')) {
      return c.json(
        { success: false, error: 'Failed to send reset email. Please try again later.' },
        500
      )
    }

    // Handle crypto errors
    if (error.message?.includes('crypto')) {
      return c.json(
        { success: false, error: 'Failed to generate reset token. Please try again.' },
        500
      )
    }

    return c.json(
      { 
        success: false, 
        error: 'Password reset request failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      500
    )
  }
})

export const POST = handle(app)
