'use client'
import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { redirect } from 'next/navigation'
import RecipeForm from '@/components/RecipeForm'

export default function CreateRecipe() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      redirect('/')
    }
  }, [isAuthenticated])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
        Create Your Own Recipe
      </h1>
      <RecipeForm />
    </div>
  )
}
