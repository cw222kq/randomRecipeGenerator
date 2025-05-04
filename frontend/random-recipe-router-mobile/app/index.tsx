import { View, Text } from 'react-native'
import getRandomRecipe from '../services/recipeService'
import { useEffect } from 'react'

export default function HomeScreen() {
  useEffect(() => {
    const testGetRandomRecipe = async () => {
      const result = await getRandomRecipe()
      console.log('result')
      console.log(result)
    }
    testGetRandomRecipe()
  }, [])

  return (
    <View className="py-6">
      <Text className="text-black dark:text-white text-3xl font-bold">
        Fetched Random Recipe
      </Text>
    </View>
  )
}
