import { View, Text } from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'
import FavoriteRecipeListItem from './FavoriteRecipeListItem'

interface FavoriteRecipeListProps {
  recipes: Recipe[]
  onRecipeClick: (recipeId: string) => void
  onUnfavorite: (recipeId: string) => void
}

export default function FavoriteRecipeList({
  recipes,
  onRecipeClick,
  onUnfavorite,
}: FavoriteRecipeListProps) {
  return (
    <View className="gap-3">
      <View className="mb-4">
        <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
          {recipes.length} favorite{recipes.length !== 1 ? 's' : ''} found!
        </Text>
      </View>

      <View className="gap-2">
        {recipes.map((recipe) => (
          <FavoriteRecipeListItem
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
            onUnfavorite={onUnfavorite}
          />
        ))}
      </View>
    </View>
  )
}
