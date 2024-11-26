'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
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

const formSchema = z.object({
  companyName: z.string().min(4, {
    message: 'Company name must be at least 4 characters.',
  }),
  companyEmail: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  subdomain: z
    .string()
    .min(4, {
      message: 'Subdomain must be at least 4 characters.',
    })
    .max(63, {
      message: 'Subdomain cannot be longer than 63 characters.',
    })
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, {
      message: 'Subdomain must start and end with a letter or number, and can contain hyphens in between.',
    }),
  numberOfBranches: z.string().transform((val) => parseInt(val, 10)),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      subdomain: '',
      numberOfBranches: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...registrationData } = values
      
      console.log('Submitting data:', registrationData)

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      // First get the response text
      const responseText = await response.text()
      console.log('Response text:', responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error('Server returned invalid response')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.emailError) {
        toast.error(
          'Registration successful, but verification email could not be sent. Please contact support.'
        )
      } else {
        toast.success('Registration successful! Please check your email to verify your account.')
      }

      form.reset()
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company email" {...field} type="email" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain</FormLabel>
              <FormControl>
                <Input placeholder="Choose your subdomain" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfBranches"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Branches</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter number of branches"
                  {...field}
                  disabled={isLoading}
                />
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
                <Input
                  type="password"
                  placeholder="Choose a secure password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Form>
  )
}
