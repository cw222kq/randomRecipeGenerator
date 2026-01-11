import { z } from 'zod'

// Define and export the Zod schema
export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.string(),
  imageUrl: z.string().url().optional(),
  spoonacularId: z.number().optional(),
})

// Infer and export the TypeScript type
export type Recipe = z.infer<typeof RecipeSchema>
