'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { login, setLoading } from '@/store/features/auth/authSlice'
import Spinner from '@/components/common/Spinner'
import { toast } from 'react-toastify'
import { getUserRecipes } from '@/services/recipeService'
import { Recipe } from '@/schemas/recipeSchema'
import RecipeList from '@/components/RecipeList'
import RecipeDetailModal from '@/components/RecipeDetailModal'
import { deleteRecipe, updateRecipe } from '@/services/recipeService'
import CollapsibleSection from '@/components/CollapsibleSection'
import RecipeForm from '@/components/RecipeForm'

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

  const handleToggleCreateRecipe = () => {
    setShowCreateRecipe(!showCreateRecipe)
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
            title="My tasty Recipies"
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

          {/* Create New Recipe Toggle Card */}
          <CollapsibleSection
            title="Create New Recipe"
            emoji="✨"
            isOpen={showCreateRecipe}
            onToggle={handleToggleCreateRecipe}
            showContentCard={true}
          >
            <RecipeForm user={user} />
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
