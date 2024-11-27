'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifySuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] = useState({
    status: 'loading' as 'loading' | 'success' | 'error',
    message: '',
    countdown: 3
  })

  useEffect(() => {
    const error = searchParams.get('error')
    const verified = searchParams.get('verified')
    const email = searchParams.get('email')
    const subdomain = searchParams.get('subdomain')
    const alreadyVerified = searchParams.get('alreadyVerified')

    console.log('[VerifySuccess] Params:', {
      error,
      verified,
      email,
      subdomain,
      alreadyVerified
    })

    let timer: NodeJS.Timeout
    let countdownInterval: NodeJS.Timeout

    const errorMessages: Record<string, string> = {
      no_token: 'No verification token was provided.',
      invalid_token: 'This verification link is invalid or has expired.',
      token_expired: 'This verification link has expired.',
      update_failed: 'Failed to update verification status. Please try again.',
      server_error: 'An unexpected error occurred. Please try again later.'
    }

    if (error) {
      console.log('[VerifySuccess] Error state:', error)
      setVerificationState(prev => ({
        ...prev,
        status: 'error',
        message: errorMessages[error] || 'Verification failed. Please try again.'
      }))
    } else if (verified === 'true' && subdomain && email) {
      const message = alreadyVerified === 'true' 
        ? 'You are already verified. Redirecting to login...'
        : 'Your email has been successfully verified! Redirecting to login...'

      console.log('[VerifySuccess] Success state:', { subdomain, email, alreadyVerified })
      
      setVerificationState(prev => ({
        ...prev,
        status: 'success',
        message
      }))

      countdownInterval = setInterval(() => {
        setVerificationState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(countdownInterval)
            
            // Ensure we're redirecting to the login page with proper parameters
            const loginUrl = new URL(`http://${subdomain}.maamul360.local:3000/login`)
            loginUrl.searchParams.set('email', email)
            loginUrl.searchParams.set('verified', 'true')
            loginUrl.searchParams.set('timestamp', Date.now().toString())
            
            console.log('[VerifySuccess] Final redirect URL:', loginUrl.toString())
            
            // Use window.location.replace for immediate redirect
            window.location.replace(loginUrl.toString())
            return prev
          }
          console.log('[VerifySuccess] Countdown:', prev.countdown - 1)
          return { ...prev, countdown: prev.countdown - 1 }
        })
      }, 1000)
    } else {
      console.log('[VerifySuccess] Invalid state')
      setVerificationState(prev => ({
        ...prev,
        status: 'error',
        message: 'Invalid verification attempt. Please try registering again.'
      }))
    }

    return () => {
      clearTimeout(timer)
      clearInterval(countdownInterval)
    }
  }, [searchParams])

  const { status, message, countdown } = verificationState

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Verifying...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-3xl font-bold text-green-900">
                Verification Successful!
              </h2>
              <p className="text-sm text-gray-600">{message}</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Redirecting in {countdown} seconds...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="text-3xl font-bold text-red-900">
                Verification Failed
              </h2>
              <p className="text-sm text-gray-600">{message}</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/register')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Register Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
