import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as z from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Safely parse JSON
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request body cannot be empty' },
        { status: 400 }
      )
    }

    // Validate input
    let validatedData
    try {
      validatedData = resetPasswordSchema.parse(body)
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

    const { token, password } = validatedData

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successful' 
    })
  } catch (error) {
    console.error('Password reset error:', error)

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

    // Handle bcrypt errors
    if (error.message?.includes('bcrypt')) {
      return NextResponse.json(
        { success: false, error: 'Password encryption failed. Please try again.' },
        { status: 500 }
      )
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
