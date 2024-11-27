import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    console.log('[VerifyEmail] Starting verification:', {
      token: token?.substring(0, 8),
      url: req.url
    })

    if (!token) {
      console.log('[VerifyEmail] Error: No token provided')
      return redirectToVerifySuccess({ error: 'no_token' })
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

    console.log('[VerifyEmail] User lookup:', {
      found: !!user,
      email: user?.email,
      subdomain: user?.tenant?.subdomain
    })

    if (!user) {
      console.log('[VerifyEmail] Error: Invalid token')
      return redirectToVerifySuccess({ error: 'invalid_token' })
    }

    // Check if token is expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      console.log('[VerifyEmail] Error: Token expired')
      return redirectToVerifySuccess({ error: 'token_expired' })
    }

    // Check if already verified
    if (user.isVerified) {
      console.log('[VerifyEmail] User already verified:', user.email)
      return redirectToVerifySuccess({
        verified: 'true',
        email: user.email,
        subdomain: user.tenant.subdomain,
        alreadyVerified: 'true'
      })
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

      console.log('[VerifyEmail] Verification successful:', {
        email: user.email,
        subdomain: user.tenant.subdomain
      })

      return redirectToVerifySuccess({
        verified: 'true',
        email: user.email,
        subdomain: user.tenant.subdomain
      })

    } catch (updateError) {
      console.error('[VerifyEmail] Update error:', updateError)
      return redirectToVerifySuccess({ error: 'update_failed' })
    }

  } catch (error) {
    console.error('[VerifyEmail] Server error:', error)
    return redirectToVerifySuccess({ error: 'server_error' })
  }
}

function redirectToVerifySuccess(params: Record<string, string>) {
  const url = new URL('/verify-success', process.env.NEXT_PUBLIC_APP_URL)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  console.log('[VerifyEmail] Redirecting to:', url.toString())
  return NextResponse.redirect(url)
}
