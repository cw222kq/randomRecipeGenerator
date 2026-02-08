import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
} from './baseService'
import validateData from '@/lib/validation'
import { getAuthHeaders } from '@/lib/authHeaders'

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
  const authHeaders = await getAuthHeaders()
  const savedRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    recipeData,
    { headers: authHeaders },
    'saved recipe',
  )
  return validateData(savedRecipe, RecipeSchema, 'saved recipe')
}

const getUserRecipes = async (userId: string): Promise<Recipe[] | null> => {
  const authHeaders = await getAuthHeaders()
  const recipes = await getRequest<Recipe[]>(
    `/api/recipe/user/${userId}/all`,
    { headers: authHeaders },
    'user recipes',
  )
  if (!recipes) {
    return null
  }

  return recipes
    .map((recipe) => validateData(recipe, RecipeSchema, 'user recipes'))
    .filter((recipe): recipe is Recipe => recipe !== null)
}

const deleteRecipe = async (
  recipeId: string,
  userId: string,
): Promise<boolean> => {
  const authHeaders = await getAuthHeaders()
  return await deleteRequest(
    `/api/recipe/${recipeId}/user/${userId}`,
    { headers: authHeaders },
    'recipe',
  )
}

const updateRecipe = async (
  recipeId: string,
  userId: string,
  recipeData: {
    title: string
    ingredients: string[]
    instructions: string
    imageUrl?: string
  },
): Promise<Recipe | null> => {
  const authHeaders = await getAuthHeaders()
  const updatedRecipe = await putRequest<Recipe>(
    `/api/recipe/${recipeId}/user/${userId}`,
    recipeData,
    { headers: authHeaders },
    'updated recipe',
  )
  return validateData(updatedRecipe, RecipeSchema, 'updated recipe')
}

const favoriteSpoonacularRecipe = async (
  userId: string,
  recipeData: {
    spoonacularId: number
    title: string
    ingredients: string[]
    instructions: string
    imageUrl?: string
  },
): Promise<Recipe | null> => {
  const authHeaders = await getAuthHeaders()
  const savedRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    {
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      imageUrl: recipeData.imageUrl,
      spoonacularId: recipeData.spoonacularId,
    },
    { headers: authHeaders },
    'saved spoonacular recipe',
  )

  if (!savedRecipe) {
    return null
  }

  // Add favorite relationship
  const favoriteRecipe = await postRequest<Recipe>(
    `/api/favorite/${userId}/${savedRecipe.id}`,
    {},
    { headers: authHeaders },
    'favorite recipe',
  )

  if (!favoriteRecipe) {
    console.error('Failed to favorite recipe')
    return null
  }

  return validateData(savedRecipe, RecipeSchema, 'favorite recipe')
}

const unfavoriteSpoonacularRecipe = async (
  userId: string,
  recipeId: string,
): Promise<boolean> => {
  try {
    const authHeaders = await getAuthHeaders()
    const unfavoriteResult = await deleteRequest(
      `/api/favorite/${userId}/${recipeId}`,
      { headers: authHeaders },
      'unfavorite recipe',
    )

    if (!unfavoriteResult) {
      return false
    }

    // Delete the recipe from the database
    const deletedResult = await deleteRequest(
      `/api/recipe/${recipeId}/user/${userId}`,
      { headers: authHeaders },
      'deleted spoonacular recipe',
    )

    if (!deletedResult) {
      return false
    }

    return deletedResult
  } catch (error) {
    console.error(
      `Error unfavoring spoonacular recipe ${recipeId} for user ${userId}`,
      error,
    )
    return false
  }
}

const getUserFavoriteRecipes = async (
  userId: string,
): Promise<Recipe[] | null> => {
  const authHeaders = await getAuthHeaders()
  const favoriteRecipes = await getRequest<Recipe[]>(
    `/api/favorite/${userId}`,
    { headers: authHeaders },
    'user favorite recipes',
  )
  if (!favoriteRecipes) {
    return null
  }

  return favoriteRecipes
    .map((recipe) =>
      validateData(recipe, RecipeSchema, 'user favorite recipes'),
    )
    .filter((recipe) => recipe !== null) as Recipe[]
}

export {
  getRandomRecipe,
  saveRecipe,
  getUserRecipes,
  deleteRecipe,
  updateRecipe,
  favoriteSpoonacularRecipe,
  unfavoriteSpoonacularRecipe,
  getUserFavoriteRecipes,
}
