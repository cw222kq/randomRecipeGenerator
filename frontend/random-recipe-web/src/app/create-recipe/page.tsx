'use client'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { redirect } from 'next/navigation'
import RecipeForm from '@/components/RecipeForm'
import Spinner from '@/components/common/Spinner'

export default function CreateRecipe() {
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth,
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/')
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to create recipes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
        Create Your Own Recipe
      </h1>
      <RecipeForm user={user} />
    </div>
  )
}
