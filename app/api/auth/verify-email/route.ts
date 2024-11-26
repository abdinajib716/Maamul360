import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // Validate token
    try {
      verifyEmailSchema.parse({ token })
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: e.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 })
      }
      throw e
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully' 
    })
  } catch (error) {
    console.error('Email verification error:', error)

    // Handle Prisma errors
    if (error.code) {
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        case 'P2003':
          return NextResponse.json(
            { success: false, error: 'Database error. Please try again.' },
            { status: 500 }
          )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
