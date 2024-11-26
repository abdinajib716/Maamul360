import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SuccessMessage } from './_components/success-message'

export default function RegistrationSuccessPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
        <SuccessMessage />
      </div>
    </div>
  )
}
