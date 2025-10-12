import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import { get, post } from './baseService'
import validateData from '@/lib/validation'

const getRandomRecipe = async (): Promise<Recipe | null> => {
  const randomRecipe = await get<Recipe>('/api/recipe', {}, 'random recipe')
  return validateData(randomRecipe, RecipeSchema, 'random recipe')
}

const saveRecipe = async (
  userId: string,
  recipeData: {
    title: string
    ingredients: string[]
    instructions: string
    imageUrl?: string
  },
): Promise<Recipe | null> => {
  const savedRecipe = await post<Recipe>(
    `/api/recipe/${userId}`,
    recipeData,
    { credentials: 'include' },
    'saved recipe',
  )
  return validateData(savedRecipe, RecipeSchema, 'saved recipe')
}

const getUserRecipes = async (userId: string): Promise<Recipe[] | null> => {
  const userRecipes = await get<Recipe[]>(
    `/api/recipe/user/${userId}/all`,
    { credentials: 'include' },
    'user recipes',
  )
  if (!userRecipes) {
    return null
  }

  // Validate each recipe in the array
  return userRecipes
    .map((recipe) => validateData(recipe, RecipeSchema, 'user recipes'))
    .filter((recipe) => recipe !== null) as Recipe[]
}

export { getRandomRecipe, saveRecipe, getUserRecipes }
