import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'

const getRandomRecipe = async (): Promise<Recipe | null> => {
  try {
    const response = await fetch('https://localhost:7087/api/recipe')

    if (!response.ok) {
      console.error(
        `Failed to fetch random recipe: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const resJSON = await response.json()
    const validatedRecipe = RecipeSchema.safeParse(resJSON)

    if (!validatedRecipe.success) {
      console.error('Recipe validation failed:', validatedRecipe.error.format())
      return null
    }

    return validatedRecipe.data
  } catch (error) {
    console.error(
      'Error fetching random recipe:',
      error instanceof Error ? error.message : error,
    )
    return null
  }
}

export default getRandomRecipe
