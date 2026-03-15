import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardContent } from './ui/card'

interface RecipeListItemProps {
  recipe: Recipe
  onClick: (recipeId: string) => void
}

export default function RecipeListItem({
  recipe,
  onClick,
}: RecipeListItemProps) {
  return (
    <TouchableOpacity onPress={() => onClick(recipe.id)} activeOpacity={0.7}>
      <Card className="mb-2 border-l-4 border-l-gray-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            {/* Recipe Image */}
            <View className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-md dark:bg-gray-700">
              {recipe.imageUrl ? (
                <Image
                  source={{ uri: recipe.imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-2xl">🍽️</Text>
                </View>
              )}
            </View>

            {/* Recipe Info */}
            <View className="min-w-0 flex-1">
              <Text
                className="text-lg font-semibold text-gray-800 dark:text-gray-100"
                numberOfLines={1}
              >
                {recipe.title}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                🥄 {recipe.ingredients.length} ingredient
                {recipe.ingredients.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}
