import { z } from 'zod'
import { UserSchema } from './userSchema'

// Response from /api/account/mobile-auth-init
export const InitializeAuthResponseSchema = z.object({
  authUrl: z.string().url(),
  state: z.string(),
})

// Request to /api/account/mobile-auth-complete
export const CompleteAuthRequestSchema = z.object({
  code: z.string(),
  state: z.string(),
  redirectUri: z.string(),
})

// Response from /api/account/mobile-auth-complete
export const CompleteAuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  expiresAt: z.string().datetime(),
})

// Infer TypeScript types
export type InitializeAuthResponse = z.infer<
  typeof InitializeAuthResponseSchema
>
export type CompleteAuthRequest = z.infer<typeof CompleteAuthRequestSchema>
export type CompleteAuthResponse = z.infer<typeof CompleteAuthResponseSchema>
