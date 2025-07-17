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

// OAuth flow state (for useGoogleAuth hook)
export const AuthStateSchema = z.object({
  isLoading: z.boolean(),
  error: z.string().nullable(),
})

// Redux auth state (for Redux store)
export const ReduxAuthStateSchema = z.object({
  user: UserSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
})

// Infer TypeScript types
export type InitializeAuthResponse = z.infer<
  typeof InitializeAuthResponseSchema
>
export type CompleteAuthRequest = z.infer<typeof CompleteAuthRequestSchema>
export type CompleteAuthResponse = z.infer<typeof CompleteAuthResponseSchema>
export type AuthState = z.infer<typeof AuthStateSchema>
export type ReduxAuthState = z.infer<typeof ReduxAuthStateSchema>

export const initialReduxAuthState: ReduxAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}
