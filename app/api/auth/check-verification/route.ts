import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const subdomain = searchParams.get('subdomain')

    if (!email || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Email and subdomain are required' },
        { status: 400 }
      )
    }

    // Find tenant
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain },
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Invalid tenant' },
        { status: 400 }
      )
    }

    // Find user and check verification status
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: tenant.id,
      },
      select: {
        isVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      isVerified: user.isVerified,
    })
  } catch (error) {
    console.error('Check verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}
