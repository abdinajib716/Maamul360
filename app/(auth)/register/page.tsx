'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { RegisterForm } from '../_components/register-form'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.get('companyName'),
          subdomain: formData.get('subdomain'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        // Redirect to tenant URL after successful registration
        if (data.data?.tenantUrl) {
          window.location.href = data.data.tenantUrl
        } else {
          router.push('/registration-success')
        }
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Register your company
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your company details below to create your account
          </p>
        </div>
        <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
