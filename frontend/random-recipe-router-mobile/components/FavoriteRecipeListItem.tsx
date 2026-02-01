import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardContent } from './ui/card'
import FavoriteButton from './FavoriteButton'

interface FavoriteRecipeListItemProps {
  recipe: Recipe
  onClick: (recipeId: string) => void
  onUnfavorite: (recipeId: string) => void
}

export default function FavoriteRecipeListItem({
  recipe,
  onClick,
  onUnfavorite,
}: FavoriteRecipeListItemProps) {
  const handleStarPress = () => {
    onUnfavorite(recipe.id)
  }

  return (
    <TouchableOpacity onPress={() => onClick(recipe.id)} activeOpacity={0.7}>
      <Card className="mb-2 border-l-4 border-l-yellow-400">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            {/* Recipe Image */}
            <View className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-md">
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
                className="text-lg font-semibold text-gray-800"
                numberOfLines={1}
              >
                {recipe.title}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                🥄 {recipe.ingredients.length} ingredient
                {recipe.ingredients.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Favorite Button */}
            <View className="mr-4">
              <FavoriteButton isFavorited={true} onPress={handleStarPress} />
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}
