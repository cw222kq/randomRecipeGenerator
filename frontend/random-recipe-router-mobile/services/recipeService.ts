import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import { getRequest, postRequest } from './baseService'
import validateData from '@/lib/validation'

const getRandomRecipe = async (): Promise<Recipe | null> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/recipe`,
    )

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

const getUserRecipes = async (userId: string): Promise<Recipe[] | null> => {
  const recipes = await getRequest<Recipe[]>(
    `/api/recipe/user/${userId}/all`,
    {},
    'user recipes',
  )
  if (!recipes) {
    return null
  }

  return recipes
    .map((recipe) => validateData(recipe, RecipeSchema, 'user recipes'))
    .filter((recipe): recipe is Recipe => recipe !== null)
}

const createRecipe = async (
  userId: string,
  recipeData: {
    title: string
    ingredients: string[]
    instructions: string
    imageUrl?: string
  },
): Promise<Recipe | null> => {
  const createdRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    recipeData,
    {},
    'created recipe',
  )
  return validateData(createdRecipe, RecipeSchema, 'created recipe')
}

export { getRandomRecipe, getUserRecipes, createRecipe }
