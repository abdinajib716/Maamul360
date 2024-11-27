'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SuccessMessage() {
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const subdomain = searchParams.get('subdomain')

  useEffect(() => {
    if (!email || !subdomain) return

    const checkVerification = async () => {
      try {
        const response = await fetch(`/api/auth/check-verification?email=${email}&subdomain=${subdomain}`)
        const data = await response.json()

        if (data.isVerified) {
          setIsVerified(true)
          // Redirect to tenant login
          window.location.href = `http://${subdomain}.maamul360.local:3000/login?email=${encodeURIComponent(email)}`
        }
      } catch (error) {
        console.error('Verification check failed:', error)
      } finally {
        setIsChecking(false)
      }
    }

    const interval = setInterval(checkVerification, 3000) // Check every 3 seconds
    checkVerification() // Initial check

    return () => clearInterval(interval)
  }, [email, subdomain])

  const handleLoginClick = () => {
    if (email && subdomain) {
      window.location.href = `http://${subdomain}.maamul360.local:3000/login?email=${encodeURIComponent(email)}`
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Registration Successful!
        </h1>
        <p className="text-sm text-muted-foreground">
          Please check your email to verify your account.
        </p>
        {isChecking ? (
          <div className="flex justify-center items-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Checking verification status...</span>
          </div>
        ) : !isVerified ? (
          <p className="text-sm text-yellow-600 mt-4">
            Waiting for email verification...
          </p>
        ) : null}
      </div>
      {!isVerified && (
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLoginClick}
          >
            Go to Login
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`mailto:${email}`}>Open Email App</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
