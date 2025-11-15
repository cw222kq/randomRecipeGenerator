import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
} from './baseService'
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
  const updatedRecipe = await putRequest<Recipe>(
    `/api/recipe/${recipeId}/user/${userId}`,
    recipeData,
    { credentials: 'include' },
    'updated recipe',
  )
  return validateData(updatedRecipe, RecipeSchema, 'updated recipe')
}

const favoriteSpoonacularRecipe = async (
  userId: string,
  recipeData: {
    title: string
    ingredients: string[]
    instructions: string
    imageUrl?: string
    spoonacularId: number
  },
): Promise<Recipe | null> => {
  // Save the recipe to the database
  const savedRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    {
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      imageUrl: recipeData.imageUrl,
      spoonacularId: recipeData.spoonacularId,
    },
    { credentials: 'include' },
    'saved spoonaculare recipe',
  )

  if (!savedRecipe) {
    return null
  }

  // Add favorite relationship
  const favoriteRecipe = await postRequest<Recipe>(
    `/api/favorite/${userId}/${savedRecipe.id}`,
    {},
    { credentials: 'include' },
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
    const unfavoriteResult = await deleteRequest(
      `/api/favorite/${userId}/${recipeId}`,
      { credentials: 'include' },
      'unfavorite recipe',
    )

    if (!unfavoriteResult) {
      return false
    }

    // Delete the recipe from the database
    const deleteResult = await deleteRequest(
      `/api/recipe/${recipeId}/user/${userId}`,
      { credentials: 'include' },
      'deleted spoonacular recipe',
    )

    if (!deleteResult) {
      return false
    }

    return deleteResult
  } catch (error) {
    console.error(
      `Error unfavoring spoonacular recipe ${recipeId} for user ${userId}`,
      error,
    )
    return false
  }
}

export {
  getRandomRecipe,
  saveRecipe,
  getUserRecipes,
  deleteRecipe,
  updateRecipe,
  favoriteSpoonacularRecipe,
  unfavoriteSpoonacularRecipe,
}
