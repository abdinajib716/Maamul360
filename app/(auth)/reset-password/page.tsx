import { ResetPasswordForm } from '../_components/reset-password-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              The password reset link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={searchParams.token} />
        </CardContent>
      </Card>
    </div>
  )
}
