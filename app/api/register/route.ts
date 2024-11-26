import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'
import { sendVerificationEmail, verifyEmailConfig } from '@/lib/email'
import { successResponse, errorResponse, validateContentType } from '@/lib/utils/api-response'
import { ValidationError, ConflictError, DatabaseError } from '@/lib/utils/api-error'

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    validateContentType(request.headers.get('content-type'))

    // Parse and validate request body
    let body: unknown
    try {
      const text = await request.text()
      if (!text) {
        throw new ValidationError('Request body is empty')
      }
      body = JSON.parse(text)
    } catch (e) {
      throw new ValidationError('Invalid JSON in request body')
    }

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be an object')
    }

    // Ensure numberOfBranches is a number
    if (typeof (body as any).numberOfBranches === 'string') {
      (body as any).numberOfBranches = parseInt((body as any).numberOfBranches, 10)
    }

    console.log('Processing registration request:', body)

    // Validate request data
    try {
      const validatedData = registerSchema.parse(body)
      console.log('Validation successful:', validatedData)

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
          throw new ConflictError('Email already registered')
        }
        if (existingTenant.subdomain === validatedData.subdomain) {
          throw new ConflictError('Subdomain already taken')
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)

      // Create verification token
      const verificationToken = crypto.randomUUID()
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Verify email configuration before proceeding
      await verifyEmailConfig()

      // Create tenant and admin user in a transaction
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Create tenant
          const tenant = await tx.tenant.create({
            data: {
              companyName: validatedData.companyName,
              companyEmail: validatedData.companyEmail,
              subdomain: validatedData.subdomain,
              numberOfBranches: validatedData.numberOfBranches,
              status: 'pending',
            },
          })

          // Create admin user
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

        // Send verification email
        try {
          await sendVerificationEmail({
            email: validatedData.companyEmail,
            token: verificationToken,
          })

          return successResponse(
            {
              tenantId: result.tenant.id,
              email: result.user.email,
              subdomain: result.tenant.subdomain,
            },
            'Registration successful! Please check your email to verify your account.',
            201
          )
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError)
          
          // Don't rollback the transaction, just notify about email issue
          return successResponse(
            {
              tenantId: result.tenant.id,
              email: result.user.email,
              subdomain: result.tenant.subdomain,
            },
            'Registration successful but verification email could not be sent. Please contact support.',
            201
          )
        }
      } catch (dbError: any) {
        console.error('Database error:', dbError)
        
        if (dbError.code === 'P2002') {
          throw new ConflictError('This email or subdomain is already registered.')
        }
        
        throw new DatabaseError('Failed to create account', dbError)
      }
    } catch (validationError) {
      console.error('Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        throw new ValidationError('Validation failed', 
          validationError.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        )
      }
      throw validationError
    }
  } catch (error) {
    return errorResponse(error)
  }
}
