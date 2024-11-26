import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

const app = new Hono()

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  subdomain: z.string().min(4, 'Invalid subdomain'),
})

app.post('/api/login', async (c) => {
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

    console.log('Received login data:', body)

    // Validate input
    let validatedData
    try {
      validatedData = loginSchema.parse(body)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation failed',
          details: e.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, 400)
      }
      throw e
    }

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
        { success: false, error: 'Invalid credentials' },
        400
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return c.json(
        { success: false, error: 'Please verify your email before logging in' },
        400
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    )

    if (!isValidPassword) {
      return c.json(
        { success: false, error: 'Invalid credentials' },
        400
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.companyName,
        subdomain: tenant.subdomain,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

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
            { 
              success: false, 
              error: 'User not found. Please check your credentials.'
            },
            404
          )
        case 'P2003':
          return c.json(
            { 
              success: false, 
              error: 'Database relation error. Please try again.'
            },
            500
          )
      }
    }

    // Handle JWT errors
    if (error.name === 'JWTError' || error.message?.includes('jwt')) {
      return c.json(
        { 
          success: false, 
          error: 'Failed to create session. Please try again.'
        },
        500
      )
    }

    // Handle bcrypt errors
    if (error.message?.includes('bcrypt')) {
      return c.json(
        { 
          success: false, 
          error: 'Password verification failed. Please try again.'
        },
        500
      )
    }

    return c.json(
      { 
        success: false, 
        error: 'Login failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      500
    )
  }
})

export const POST = handle(app)
