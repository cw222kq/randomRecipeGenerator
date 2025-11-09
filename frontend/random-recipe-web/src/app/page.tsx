'use client'
import { useEffect, useState } from 'react'
import {
  favoriteSpoonacularRecipe,
  getRandomRecipe,
  unfavoriteSpoonacularRecipe,
} from '@/services/recipeService'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'
import Spinner from '@/components/common/Spinner'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { toast } from 'react-toastify'

/* Module-level variable to prevent double initialization in React Strict Mode
This follows the official React documentation pattern for one-time app initialization
Reference: https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application */
let didInit = false

export default function HomeRoute() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  )

  const [initialRecipe, setInitialRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFavorited, setIsFavorited] = useState<boolean>(false)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [isFavoriting, setIsFavoriting] = useState<boolean>(false)

  const getInitialRandomRecipe = async () => {
    setIsLoading(true)
    const result: Recipe | null = await getRandomRecipe()
    setInitialRecipe(result)
    setIsFavorited(false)
    setSavedRecipeId(null)
    setIsLoading(false)
  }

  const handleToggleFavorite = async () => {
    if (!user || !initialRecipe) {
      toast.error('Unable to favorite recipe')
      return
    }

    setIsFavoriting(true)
    try {
      if (isFavorited && savedRecipeId) {
        // Unfavorite and delete recipe
        const result = await unfavoriteSpoonacularRecipe(user.id, savedRecipeId)

        if (!result) {
          toast.error('Failed to remove recipe')
          return
        }

        setIsFavorited(false)
        setSavedRecipeId(null)
        toast.success('Recipe removed from favorites')
      } else {
        // Save and favorite the Spoonacular recipe
        const savedRecipe = await favoriteSpoonacularRecipe(user.id, {
          title: initialRecipe.title,
          ingredients: initialRecipe.ingredients,
          instructions: initialRecipe.instructions,
          imageUrl: initialRecipe.imageUrl,
          spoonacularId: 12345, // TODO: get the spoonacular id from the initial recipe!!!
        })

        if (!savedRecipe) {
          toast.error('Failed to save recipe')
          return
        }

        setIsFavorited(true)
        setSavedRecipeId(savedRecipe.id)
        toast.success('Recipe saved and favorited')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    } finally {
      setIsFavoriting(false)
    }
  }

  useEffect(() => {
    /* Prevent double execution in development mode (React Strict Mode)
    Uses module-level variable as recommended by React team */
    if (didInit) {
      return
    }
    getInitialRandomRecipe()
    didInit = true
  }, [])

  if (isLoading) {
    return <Spinner />
  }

  if (!initialRecipe) {
    return <div className="py-6 text-center">No recipe found</div>
  }
  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:mb-8 md:text-3xl">
        Fetched Random Recipe
      </h1>
      <RecipeCard
        recipe={initialRecipe}
        onNewRecipe={getInitialRandomRecipe}
        isAuthenticated={isAuthenticated}
        user={user}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={isFavorited}
        isFavoriting={isFavoriting}
        savedRecipeId={savedRecipeId}
      />
    </div>
  )
}
