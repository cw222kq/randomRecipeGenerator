import { z } from 'zod'

// Define and export the Zod schema
export const userSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

// Infer and export the TypeScript type
export type User = z.infer<typeof userSchema>
