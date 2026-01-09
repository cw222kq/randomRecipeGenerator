import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
} from './baseService'
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
    {},
    'saved recipe',
  )
  return validateData(savedRecipe, RecipeSchema, 'saved recipe')
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

const deleteRecipe = async (
  recipeId: string,
  userId: string,
): Promise<boolean> => {
  return await deleteRequest(
    `/api/recipe/${recipeId}/user/${userId}`,
    {},
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
    {},
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
  const savedRecipe = await postRequest<Recipe>(
    `/api/recipe/${userId}`,
    {
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      imageUrl: recipeData.imageUrl,
      spoonacularId: recipeData.spoonacularId,
    },
    {},
    'saved spoonacular recipe',
  )

  if (!savedRecipe) {
    return null
  }

  // Add favorite relationship
  const favoriteRecipe = await postRequest<Recipe>(
    `/api/favorite/${userId}/${savedRecipe.id}`,
    {},
    {},
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
      {},
      'unfavorite recipe',
    )

    if (!unfavoriteResult) {
      return false
    }

    // Delete the recipe from the database
    const deletedResult = await deleteRequest(
      `/api/recipe/${recipeId}/user/${userId}`,
      {},
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
  const favoriteRecipes = await getRequest<Recipe[]>(
    `/api/favorite/user/${userId}`,
    {},
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
