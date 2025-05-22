import { RecipeSchema, Recipe } from '@/schemas/recipeSchema'
import get from './baseService'
import validateData from '@/lib/validation'

const getRandomRecipe = async (): Promise<Recipe | null> => {
  const randomRecipe = await get<Recipe>('/api/recipe', {}, 'random recipe')
  return validateData(randomRecipe, RecipeSchema, 'random recipe')
}

export default getRandomRecipe
