'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  subdomain: z.string().min(3, {
    message: 'Please enter your company subdomain.',
  }),
})

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get the current host to extract subdomain
  const currentHost = typeof window !== 'undefined' ? window.location.host : ''
  const subdomain = currentHost.split('.')[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: searchParams?.get('email') || '',
      password: '',
      subdomain: subdomain !== 'maamul360' ? subdomain : '',
    },
  })

  // Update form values when URL parameters change
  useEffect(() => {
    const email = searchParams?.get('email')
    if (email) {
      form.setValue('email', email)
    }
    
    // If we're on a subdomain, set it in the form
    if (subdomain && subdomain !== 'maamul360') {
      form.setValue('subdomain', subdomain)
    }
  }, [searchParams, form, subdomain])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('[LoginForm] Submitting:', { values })
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      console.log('[LoginForm] Login successful:', data)
      
      // Construct tenant URL and redirect
      const tenantUrl = `http://${values.subdomain}.maamul360.local:3000/dashboard`
      console.log('[LoginForm] Redirecting to:', tenantUrl)
      window.location.href = tenantUrl
    } catch (error) {
      console.error('[LoginForm] Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Subdomain</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your-company" 
                  {...field} 
                  disabled={subdomain && subdomain !== 'maamul360'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <div className="text-sm text-red-500 mt-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="text-center mt-4">
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      </form>
    </Form>
  )
}
