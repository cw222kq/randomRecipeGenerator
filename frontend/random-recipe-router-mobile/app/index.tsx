import { View, Text } from 'react-native'
import { getRandomRecipe } from '../services/recipeService'
import { useEffect, useState } from 'react'
import RecipeCard from '../components/RecipeCard'
import { Recipe } from '@/schemas/recipeSchema'

export default function HomeScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFavorited, setIsFavorited] = useState<boolean>(false)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [isFavoriting, setIsFavoriting] = useState<boolean>(false)

  const fetchRandomRecipe = async () => {
    setIsLoading(true)
    const result: Recipe | null = await getRandomRecipe()
    setRecipe(result)
    setIsFavorited(false)
    setSavedRecipeId(null)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRandomRecipe()
  }, [])

  if (!recipe) {
    return <Text>No recipe found</Text>
  }

  return (
    <View className="flex-1 py-6">
      <Text className="text-black dark:text-white text-2xl font-bold px-4">
        Fetched Random Recipe
      </Text>
      <RecipeCard recipe={recipe} onNewRecipe={fetchRandomRecipe} />
    </View>
  )
}
