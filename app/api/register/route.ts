import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'
import { sendVerificationEmail, verifyEmailConfig } from '@/lib/email'
import { ValidationError, ConflictError, DatabaseError, RequestError, ServerError } from '@/lib/utils/api-error'

export async function POST(req: NextRequest) {
  try {
    // Basic validation
    if (!req.body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      )
    }

    // Content-type validation
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 415 }
      )
    }

    // Parse request body
    let requestData: any
    try {
      requestData = await req.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Validate request data
    try {
      const validatedData = registerSchema.parse(requestData)

      // Check existing tenant
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { companyEmail: validatedData.companyEmail },
            { subdomain: validatedData.subdomain },
          ],
        },
      })

      if (existingTenant) {
        if (existingTenant.companyEmail === validatedData.companyEmail) {
          return NextResponse.json(
            { success: false, error: 'Email already registered' },
            { status: 409 }
          )
        }
        if (existingTenant.subdomain === validatedData.subdomain) {
          return NextResponse.json(
            { success: false, error: 'Subdomain already taken' },
            { status: 409 }
          )
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)

      // Create verification token
      const verificationToken = crypto.randomUUID()
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      // Create tenant and admin user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            companyName: validatedData.companyName,
            companyEmail: validatedData.companyEmail,
            subdomain: validatedData.subdomain,
            numberOfBranches: Number(validatedData.numberOfBranches),
            status: 'pending',
          },
        })

        const user = await tx.user.create({
          data: {
            email: validatedData.companyEmail,
            password: hashedPassword,
            role: 'admin',
            tenantId: tenant.id,
            verificationToken,
            verificationExpires,
            isVerified: false,
          },
        })

        return { tenant, user }
      })

      // Try to send verification email
      let emailSent = false
      try {
        await sendVerificationEmail({
          email: validatedData.companyEmail,
          token: verificationToken,
        })
        emailSent = true
      } catch (error) {
        console.error('Failed to send verification email:', error)
      }

      // After successful registration
      return NextResponse.json({
        success: true,
        message: emailSent
          ? 'Registration successful! Please check your email to verify your account.'
          : 'Registration successful but verification email could not be sent. Please contact support.',
        data: {
          email: result.user.email,
          subdomain: result.tenant.subdomain,
          redirectUrl: `http://maamul360.local:3000/registration-success`
        }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }, { status: 400 })
      }

      if (error instanceof Error) {
        console.error('Registration error:', error)
        return NextResponse.json({
          success: false,
          error: 'Registration failed',
          details: process.env.NODE_ENV === 'development' ? {
            message: error.message,
            stack: error.stack
          } : undefined
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: 'An unexpected error occurred'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 })
  }
}
