import { z } from 'zod'
import { userSchema } from './userSchema'

// Define and export the Zod schema
export const authStateSchema = z.object({
  user: userSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
})

// Infer and export the TypeScript type
export type AuthState = z.infer<typeof authStateSchema>

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
}
