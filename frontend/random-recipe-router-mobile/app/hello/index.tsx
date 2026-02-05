import { View, Text, Alert } from 'react-native'
import { useAppSelector } from '@/store/hooks'
import { useState } from 'react'
import { Recipe } from '@/schemas/recipeSchema'
import {
  getUserFavoriteRecipes,
  unfavoriteSpoonacularRecipe,
} from '@/services/recipeService'

export default function Hello() {
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  )

  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  const handleToggleFavorite = async () => {
    if (!showFavorites && user) {
      setIsLoadingFavorites(true)
      setFavoritesError(null)

      try {
        const userFavoriteRecipes: Recipe[] | null =
          await getUserFavoriteRecipes(user.id)
        if (!userFavoriteRecipes) {
          setFavoritesError('Failed to load favorite recipes')
          return
        }
        setFavoriteRecipes(userFavoriteRecipes)
      } catch (error) {
        console.error('Error loading favorite recipes:', error)
        setFavoritesError(
          'An error occurred while loading the favorite recipes',
        )
      } finally {
        setIsLoadingFavorites(false)
      }
    }
    setShowFavorites(!showFavorites)
  }

  const handleRecipeClick = (recipeId: string) => {
    const recipe = favoriteRecipes.find((recipe) => recipe.id === recipeId)
    if (!recipe) {
      console.error('Recipe not found')
      return
    }
    console.log('Recipe clicked:', recipe)
  }

  const handleUnfavoriteRecipe = async (recipeId: string) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      const result = await unfavoriteSpoonacularRecipe(user.id, recipeId)

      if (!result) {
        console.error('Failed to unfavorite recipe')
        return
      }

      // Remove from local state
      setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe.id !== recipeId),
      )
    } catch (error) {
      console.error('Error unfavoriting recipe:', error)
    }
  }

  if (isLoading) {
    return (
      <View className="py-6">
        <Text className="text-black dark:text-white text-lg">Loading...</Text>
      </View>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <View className="py-6">
        <Text className="text-black dark:text-white text-lg">
          Please sign in to continue
        </Text>
      </View>
    )
  }

  return (
    <View className="py-6">
      <Text className="text-black dark:text-white text-3xl font-bold">
        Welcome {user.firstName} {user.lastName}
      </Text>
    </View>
  )
}
