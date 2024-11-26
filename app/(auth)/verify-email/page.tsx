import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function verifyEmail(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      throw new Error('Verification failed')
    }

    return true
  } catch (error) {
    return false
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  let verified = false
  if (searchParams.token) {
    verified = await verifyEmail(searchParams.token)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {!searchParams.token ? (
            <p className="text-center text-muted-foreground">
              Invalid verification link.
            </p>
          ) : verified ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">
                Your email has been verified successfully!
              </p>
              <a
                href="/login"
                className="text-primary hover:underline"
              >
                Click here to login
              </a>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              The verification link is invalid or has expired.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
