import { View, Text } from 'react-native'
import getRandomRecipe from '../services/recipeService'
import { useEffect, useState } from 'react'
import RecipeCard from '../components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'

export default function HomeScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  useEffect(() => {
    const resultGetRandomRecipe = async () => {
      const result: Recipe | null = await getRandomRecipe()
      setRecipe(result)
    }
    resultGetRandomRecipe()
  }, [])

  if (!recipe) {
    return <Text>No recipe found</Text>
  }

  return (
    <View className="flex-1 py-6">
      <Text className="text-black dark:text-white text-3xl font-bold">
        Fetched Random Recipe
      </Text>
      <RecipeCard recipe={recipe} />
    </View>
  )
}
