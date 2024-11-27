import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
        isVerified: false,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    })

    // Update tenant status if this is the admin user
    if (user.role === 'admin') {
      await prisma.tenant.update({
        where: { id: user.tenantId },
        data: { status: 'active' },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred during email verification'
    }, { status: 500 })
  }
}
