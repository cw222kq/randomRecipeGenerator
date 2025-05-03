import getRandomRecipe from '@/services/recipeService'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'

export default async function HomeRoute() {
  const result: Recipe | null = await getRandomRecipe()
  console.log('result', result)

  if (!result) {
    return <div className="py-6 text-center">No recipe found</div>
  }
  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:mb-8 md:text-3xl">
        Fetched Random Recipe
      </h1>
      <RecipeCard recipe={result} />
    </div>
  )
}
