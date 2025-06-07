import { z } from 'zod'

export const UserSchema = z.object({
  googleUserId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>
