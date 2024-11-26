import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function SuccessMessage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Registration Successful!
        </h1>
        <p className="text-sm text-muted-foreground">
          Thank you for registering. We will review your application and get back to you shortly.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}
