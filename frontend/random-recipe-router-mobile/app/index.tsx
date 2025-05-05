import { View, Text } from 'react-native'
import getRandomRecipe from '../services/recipeService'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'

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
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Manual Setup Card</CardTitle>
          <CardDescription>This card was added manually.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>This is the main content area of the card.</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer content goes here.</Text>
        </CardFooter>
      </Card>
    </View>
  )
}
