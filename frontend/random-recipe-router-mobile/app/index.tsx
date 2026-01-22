import { View, Text, ActivityIndicator } from 'react-native'
import {
  getRandomRecipe,
  favoriteSpoonacularRecipe,
  unfavoriteSpoonacularRecipe,
} from '../services/recipeService'
import { useEffect, useState } from 'react'
import RecipeCard from '../components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'
import { useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'

export default function HomeScreen() {
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.auth,
  )
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFavorited, setIsFavorited] = useState<boolean>(false)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [isFavoriting, setIsFavoriting] = useState<boolean>(false)

  const fetchRandomRecipe = async () => {
    setIsLoading(true)
    const result: Recipe | null = await getRandomRecipe()
    setRecipe(result)
    setIsFavorited(false)
    setSavedRecipeId(null)
    setIsLoading(false)
  }

  const handleToggleFavorite = async () => {
    if (!user || !recipe || !recipe.spoonacularId) {
      console.error('Unable to toggle favorite')
      return
    }

    setIsFavoriting(true)
    try {
      if (isFavorited && savedRecipeId) {
        const result = await unfavoriteSpoonacularRecipe(user.id, savedRecipeId)

        if (!result) {
          console.error('Failed to remove recipe')
          return
        }

        setIsFavorited(false)
        setSavedRecipeId(null)
        console.log('Recipe removed from favorites')
        return
      }

      const savedRecipe = await favoriteSpoonacularRecipe(user.id, {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        imageUrl: recipe.imageUrl ?? undefined,
        spoonacularId: recipe.spoonacularId,
      })

      if (!savedRecipe) {
        console.error('Failed to save recipe')
        return
      }

      setIsFavorited(true)
      setSavedRecipeId(savedRecipe.id)
      console.log('Recipe saved and favorited')
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriting(false)
    }
  }

  useEffect(() => {
    fetchRandomRecipe()
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-black dark:text-white text-2xl font-bold px-4">
          No recipe found
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 py-6">
      <Text className="text-black dark:text-white text-2xl font-bold px-4">
        Fetched Random Recipe
      </Text>
      <RecipeCard recipe={recipe} onNewRecipe={fetchRandomRecipe} />
    </View>
  )
}
