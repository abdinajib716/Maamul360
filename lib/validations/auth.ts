import { z } from 'zod'

export const registerSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters'),
  companyEmail: z
    .string()
    .email('Invalid email format'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must not exceed 63 characters')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen'
    ),
  numberOfBranches: z
    .number()
    .int('Number of branches must be an integer')
    .min(1, 'Must have at least 1 branch'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const verifyEmailSchema = z.object({
  token: z.string(),
})
