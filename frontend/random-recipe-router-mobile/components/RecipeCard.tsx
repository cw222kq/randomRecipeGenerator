import { Text, View, ScrollView, TouchableOpacity } from 'react-native'
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
import { User } from '../schemas/userSchema'
import FavoriteButton from './FavoriteButton'

interface RecipeCardProps {
  recipe: Recipe
  onNewRecipe: () => void
  isAuthenticated: boolean
  user: User | null
  isFavorited: boolean
  isFavoriting: boolean
  onToggleFavorite: () => void
}

export default function RecipeCard({
  recipe,
  onNewRecipe,
  isAuthenticated,
  user,
  isFavorited,
  isFavoriting,
  onToggleFavorite,
}: RecipeCardProps) {
  return (
    <Card className="m-4 flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <CardTitle className="text-black dark:text-white">
              {recipe.title}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Description
            </CardDescription>
          </View>
          {isAuthenticated && user && (
            <FavoriteButton
              isFavorited={isFavorited}
              onPress={onToggleFavorite}
              disabled={isFavoriting}
              isLoading={isFavoriting}
            />
          )}
        </View>
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
          <View className="mt-4 rounded-lg border border-gray-200 px-4 py-4 dark:border-gray-700">
            <Text className="mb-2 text-lg font-semibold text-black dark:text-white">
              Ingredients:
            </Text>
            {recipe.ingredients.map((ingredient, i) => (
              <Text key={i} className="text-black dark:text-gray-300">
                {'• '}
                {ingredient}
              </Text>
            ))}
          </View>

          {/* Instructions */}
          <View className="mt-4 rounded-lg border border-gray-200 px-4 py-4 dark:border-gray-700">
            <Text className="mb-2 text-lg font-semibold text-black dark:text-white">
              Instructions:
            </Text>
            <Text className="text-black dark:text-gray-300">
              {recipe.instructions}
            </Text>
          </View>
        </ScrollView>
      </CardContent>
      <CardFooter>
        <View className="flex-row justify-center w-full">
          <TouchableOpacity
            onPress={onNewRecipe}
            className="rounded-lg bg-gray-900 px-6 py-3 dark:bg-gray-100"
            activeOpacity={0.7}
          >
            <Text className="font-semibold text-white dark:text-gray-900">
              New Recipe
            </Text>
          </TouchableOpacity>
        </View>
      </CardFooter>
    </Card>
  )
}
