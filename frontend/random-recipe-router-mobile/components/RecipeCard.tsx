import { Text, View, ScrollView, Button } from 'react-native'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Recipe } from '../schemas/recipeSchema'
import { Image } from 'react-native'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="m-4 flex-1">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollView>
          {/* Image */}
          <View className="relative mb-4 aspect-video w-full">
            <Image
              className="rounded-md"
              source={{ uri: recipe.imageUrl }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          {/* Ingredients */}
          <View className="mt-4 rounded-lg border px-4 py-4">
            <Text className="mb-2 text-lg font-semibold">Ingredients:</Text>
            {recipe.ingredients.map((ingredient, i) => (
              <Text key={i}>
                {'• '}
                {ingredient}
              </Text>
            ))}
          </View>

          {/* Instructions */}
          <View className="mt-4 rounded-lg border px-4 py-4">
            <Text className="mb-2 text-lg font-semibold">Instructions:</Text>
            <Text>{recipe.instructions}</Text>
          </View>
        </ScrollView>
      </CardContent>
      <CardFooter>
        <View className="flex-row justify-between w-full">
          {/* When logged in
          <Button color="black" title="Save Recipe" />
          */}
          {/* When logged out */}
          <Button color="gray" title="New Recipe" />
        </View>
      </CardFooter>
    </Card>
  )
}
