'use client'
import { useEffect, useState } from 'react'
import getRandomRecipe from '@/services/recipeService'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'
import Spinner from '@/components/common/Spinner'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

/* Module-level variable to prevent double initialization in React Strict Mode
This follows the official React documentation pattern for one-time app initialization
Reference: https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application */
let didInit = false

export default function HomeRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [initialRecipe, setInitialRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getInitialRandomRecipe = async () => {
    setIsLoading(true)
    const result: Recipe | null = await getRandomRecipe()
    setInitialRecipe(result)
    setIsLoading(false)
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
      />
    </div>
  )
}
