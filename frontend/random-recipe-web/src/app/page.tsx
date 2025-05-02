import getRandomRecipe from '@/services/recipeService'

export default async function HomeRoute() {
  const result = await getRandomRecipe()
  console.log('result', result)
  return (
    <div className="py-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Fetched Random Recipe
      </h1>
    </div>
  )
}
