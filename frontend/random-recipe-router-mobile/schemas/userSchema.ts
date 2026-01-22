import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  googleUserId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
})

export type User = z.infer<typeof UserSchema>
