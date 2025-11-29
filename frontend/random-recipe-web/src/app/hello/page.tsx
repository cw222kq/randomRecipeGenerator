'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { login, setLoading } from '@/store/features/auth/authSlice'
import Spinner from '@/components/common/Spinner'
import { toast } from 'react-toastify'
import {
  getUserRecipes,
  getUserFavoriteRecipes,
} from '@/services/recipeService'
import { Recipe } from '@/schemas/recipeSchema'
import RecipeList from '@/components/RecipeList'
import RecipeDetailModal from '@/components/RecipeDetailModal'
import {
  deleteRecipe,
  updateRecipe,
  unfavoriteSpoonacularRecipe,
} from '@/services/recipeService'
import CollapsibleSection from '@/components/CollapsibleSection'
import RecipeForm from '@/components/RecipeForm'
import FavoriteRecipeListItem from '@/components/FavoriteRecipeListItem'

export default function Hello() {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState<boolean>(false)
  const [showRecipes, setShowRecipes] = useState<boolean>(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false)
  const [recipesError, setRecipesError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [showCreateRecipe, setShowCreateRecipe] = useState<boolean>(false)
  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  useEffect(() => {
    const setLoggedInUser = async () => {
      try {
        dispatch(setLoading(true))
        setError(null)
        const loggedInUser: User | null = await getLoggedInUser()
        console.log('request logged in user!!!!!')
        if (loggedInUser === null) {
          return
        }
        dispatch(login(loggedInUser))
        toast.info(`Hello, Welcome ${loggedInUser.firstName}!`)
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('An error occurred while fetching the user data')
      } finally {
        dispatch(setLoading(false))
        setHasChecked(true)
      }
    }

    if (user === null && !hasChecked && !isLoading) {
      setLoggedInUser()
    }
  }, [user, dispatch, hasChecked, isLoading])

  useEffect(() => {
    if (recipesError) {
      toast.error(recipesError)
    }
  }, [recipesError])

  const handleToggleRecipes = async () => {
    if (!showRecipes && user) {
      setIsLoadingRecipes(true)
      setRecipesError(null)

      try {
        const userRecipes: Recipe[] | null = await getUserRecipes(user.id)
        if (!userRecipes) {
          setRecipesError('Failed to load recipes')
          return
        }
        setRecipes(userRecipes)
      } catch (error) {
        console.error('Error loading recipes:', error)
        setRecipesError('An error occurred while loading the recipes')
      } finally {
        setIsLoadingRecipes(false)
      }
    }
    setShowRecipes(!showRecipes)
  }

  const handleToggleFavorite = async () => {
    if (!showRecipes && user) {
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
    const recipe = recipes.find((recipe) => recipe.id === recipeId)
    if (!recipe) {
      toast.error('Recipe not found')
      return
    }
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecipe(null)
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this recipe? This action cannot be undone.',
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteRecipe(recipeId, user.id)

      toast.success('Recipe deleted successfully')

      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeId),
      )

      if (selectedRecipe?.id === recipeId) {
        handleCloseModal()
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast.error('Failed to delete recipe')
    } finally {
      setIsLoadingRecipes(false)
    }
  }

  const handleUpdateRecipe = async (
    recipeId: string,
    recipeData: {
      title: string
      ingredients: string[]
      instructions: string
      imageUrl?: string
    },
  ) => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    try {
      const updatedRecipe = await updateRecipe(recipeId, user.id, recipeData)

      if (!updatedRecipe) {
        toast.error('Failed to update recipe. Please try again.')
        return
      }

      toast.success('Recipe updated successfully!')

      // Update recipe in local state
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? updatedRecipe : recipe,
        ),
      )

      // Update selected recipe for the modal
      setSelectedRecipe(updatedRecipe)
    } catch (error) {
      console.error('Error updating recipe:', error)
      toast.error('An error occurred while updating the recipe.')
    }
  }

  const handleUnfavoriteRecipe = async (recipeId: string) => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove this recipe from favorites? This will also delete the recipe from your collection.',
    )

    if (!confirmed) {
      return
    }

    try {
      const result = await unfavoriteSpoonacularRecipe(user.id, recipeId)

      if (!result) {
        toast.error('Failed to unfavorite recipe')
        return
      }

      toast.success('Recipe removed from favorites')

      // Remove from local state
      setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe.id !== recipeId),
      )

      // Close modal if it's open for this recipe
      if (selectedRecipe?.id === recipeId) {
        handleCloseModal()
      }
    } catch (error) {
      console.error('Error unfavoriting recipe:', error)
      toast.error('Failed to unfavorite recipe')
    }
  }

  const handleToggleCreateRecipe = () => {
    setShowCreateRecipe(!showCreateRecipe)
  }

  const handleRecipeCreated = () => {
    // Refresh recipe list after creation
    if (user) {
      getUserRecipes(user.id).then((userRecipes) => {
        if (userRecipes) {
          setRecipes(userRecipes)
          // Expand the recipes section
          setShowRecipes(true)
        }
      })
    }
    // Close the create form
    setShowCreateRecipe(false)
  }

  return (
    <div className="py-6">
      {error && <div className="mb-8 text-red-500">{error}</div>}
      {isLoading && <Spinner />}
      {!user && (
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          From the Hello page!!!!!!
        </h1>
      )}
      {user && (
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">
            Hello {user.firstName} {user.lastName}!
          </h1>

          {/* My recipies Toggle Card */}
          <CollapsibleSection
            title="My Tasty Recipies"
            emoji="🍳"
            isOpen={showRecipes}
            onToggle={handleToggleRecipes}
            showContentCard={true}
          >
            {isLoadingRecipes && (
              <div className="text-center">
                <Spinner />
                <p className="mt-2 text-gray-600">Loading your recipes...</p>
              </div>
            )}

            {!isLoadingRecipes && !recipesError && recipes.length === 0 && (
              <div className="text-center text-gray-600">
                <p>You don not have any created recipes yet.</p>
              </div>
            )}

            {!isLoadingRecipes && !recipesError && recipes.length > 0 && (
              <RecipeList recipes={recipes} onRecipeClick={handleRecipeClick} />
            )}
          </CollapsibleSection>

          {/* My Favorite Recipes Toggle Card */}
          <CollapsibleSection
            title="My Favorite Recipes"
            emoji="⭐"
            isOpen={showFavorites}
            onToggle={handleToggleFavorite}
            showContentCard={true}
          >
            {isLoadingFavorites && (
              <div className="text-center">
                <Spinner />
                <p className="mt-2 text-gray-600">Loading your favorites...</p>
              </div>
            )}

            {!isLoadingFavorites &&
              !favoritesError &&
              favoriteRecipes.length === 0 && (
                <div className="text-center text-gray-600">
                  <p>You don not have any favorite recipes yet.</p>
                  <p className="mt-1 text-sm">
                    Favorite recipes from the home page to see them here!
                  </p>
                </div>
              )}

            {!isLoadingFavorites &&
              !favoritesError &&
              favoriteRecipes.length > 0 && (
                <div className="space-y-2">
                  {favoriteRecipes.map((recipe) => (
                    <FavoriteRecipeListItem
                      key={recipe.id}
                      recipe={recipe}
                      onClick={handleRecipeClick}
                      onUnfavorite={handleUnfavoriteRecipe}
                    />
                  ))}
                </div>
              )}
          </CollapsibleSection>

          {/* Create New Recipe Toggle Card */}
          <CollapsibleSection
            title="Create New Recipe"
            emoji="🧑‍🍳"
            isOpen={showCreateRecipe}
            onToggle={handleToggleCreateRecipe}
            showContentCard={true}
          >
            <RecipeForm user={user} onRecipeCreated={handleRecipeCreated} />
          </CollapsibleSection>
        </div>
      )}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteRecipe}
        onUpdate={handleUpdateRecipe}
      />
    </div>
  )
}
