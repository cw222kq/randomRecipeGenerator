import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import { getRequest, postRequest, deleteRequest } from './baseService'
import validateData from '@/lib/validation'

const getRandomRecipe = async (): Promise<Recipe | null> => {
  const randomRecipe = await getRequest<Recipe>(
    '/api/recipe',
    {},
    'random recipe',
  )
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
  const savedRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    recipeData,
    { credentials: 'include' },
    'saved recipe',
  )
  return validateData(savedRecipe, RecipeSchema, 'saved recipe')
}

const getUserRecipes = async (userId: string): Promise<Recipe[] | null> => {
  const userRecipes = await getRequest<Recipe[]>(
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

const deleteRecipe = async (
  recipeId: string,
  userId: string,
): Promise<boolean> => {
  return await deleteRequest(
    `/api/recipe/${recipeId}/user/${userId}`,
    { credentials: 'include' },
    'recipe',
  )
}

export { getRandomRecipe, saveRecipe, getUserRecipes, deleteRecipe }
