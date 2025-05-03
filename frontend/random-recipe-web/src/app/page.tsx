import getRandomRecipe from '@/services/recipeService'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'

export default async function HomeRoute() {
  const result: Recipe | null = await getRandomRecipe()
  console.log('result', result)

  if (!result) {
    return <div>No recipe found</div>
  }
  return (
    <div className="py-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Fetched Random Recipe
      </h1>
      <RecipeCard recipe={result} />
    </div>
  )
}
