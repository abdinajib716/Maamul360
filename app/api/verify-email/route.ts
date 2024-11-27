import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    console.log('Starting verification process for token:', token?.substring(0, 8))

    if (!token) {
      console.error('Verification failed: No token provided')
      return NextResponse.redirect(new URL('/verify-success?error=no_token', process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
      include: {
        tenant: true,
      },
    })

    console.log('User lookup result:', user ? 'Found' : 'Not found')

    if (!user) {
      console.error('Verification failed: Invalid token')
      return NextResponse.redirect(new URL('/verify-success?error=invalid_token', process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Check if token is expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      console.error('Verification failed: Token expired')
      return NextResponse.redirect(new URL('/verify-success?error=token_expired', process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Check if already verified
    if (user.isVerified) {
      console.log('User already verified:', user.email)
      const loginUrl = `http://${user.tenant.subdomain}.maamul360.local:3000/login?email=${encodeURIComponent(user.email)}`
      return NextResponse.redirect(loginUrl)
    }

    try {
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

      console.log('User verified successfully:', user.email)

      // Create success URL with parameters
      const successUrl = new URL('/verify-success', process.env.NEXT_PUBLIC_APP_URL!)
      successUrl.searchParams.set('verified', 'true')
      successUrl.searchParams.set('subdomain', user.tenant.subdomain)
      successUrl.searchParams.set('email', user.email)

      // Create response with redirect
      const response = NextResponse.redirect(successUrl)

      // Set verification cookie with proper configuration
      response.cookies.set('verification_status', 'success', {
        maxAge: 60,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      return response

    } catch (updateError) {
      console.error('Error updating user/tenant:', updateError)
      return NextResponse.redirect(new URL('/verify-success?error=update_failed', process.env.NEXT_PUBLIC_APP_URL!))
    }

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-success?error=server_error', process.env.NEXT_PUBLIC_APP_URL!))
  }
}
