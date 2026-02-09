import { View, Text, Alert, ActivityIndicator } from 'react-native'
import { useAppSelector } from '@/store/hooks'
import { useState } from 'react'
import { Recipe } from '@/schemas/recipeSchema'
import {
  getUserFavoriteRecipes,
  unfavoriteSpoonacularRecipe,
} from '@/services/recipeService'
import CollapsibleSection from '@/components/CollapsibleSection'
import FavoriteRecipeList from '@/components/FavoriteRecipeList'

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

  return (
    <View className="flex-1 px-4 py-6">
      {isLoading && (
        <Text className="text-black dark:text-white text-lg">Loading...</Text>
      )}

      {!isLoading && !user && (
        <Text className="text-black dark:text-white text-lg">
          Please sign in to continue
        </Text>
      )}

      {!isLoading && user && (
        <>
          <Text className="mb-8 text-black dark:text-white text-2xl font-bold">
            Hello {user.firstName} {user.lastName}!
          </Text>

          <CollapsibleSection
            title="My Favorite Recipes"
            emoji="⭐"
            isOpen={showFavorites}
            onToggle={handleToggleFavorite}
            showContentCard={true}
          >
            {isLoadingFavorites && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" />
                <Text className="mt-2 text-gray-600">
                  Loading your favorites...
                </Text>
              </View>
            )}

            {!isLoadingFavorites && favoritesError && (
              <View className="items-center py-4">
                <Text className="text-red-500 text-center">
                  {favoritesError}
                </Text>
              </View>
            )}

            {!isLoadingFavorites &&
              !favoritesError &&
              favoriteRecipes.length === 0 && (
                <View className="items-center py-4">
                  <Text className="text-center text-gray-600">
                    You don't have any favorite recipes yet.
                  </Text>
                  <Text className="mt-1 text-center text-sm text-gray-500">
                    Favorite recipes from the home page to see them here!
                  </Text>
                </View>
              )}

            {!isLoadingFavorites &&
              !favoritesError &&
              favoriteRecipes.length > 0 && (
                <FavoriteRecipeList
                  recipes={favoriteRecipes}
                  onRecipeClick={handleRecipeClick}
                  onUnfavorite={handleUnfavoriteRecipe}
                />
              )}
          </CollapsibleSection>
        </>
      )}
    </View>
  )
}
