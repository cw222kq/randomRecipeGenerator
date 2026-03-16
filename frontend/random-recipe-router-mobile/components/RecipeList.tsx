import { View, Text } from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'
import RecipeListItem from './RecipeListItem'
interface RecipeListProps {
  recipes: Recipe[]
  onRecipeClick: (recipeId: string) => void
}
export default function RecipeList({
  recipes,
  onRecipeClick,
}: RecipeListProps) {
  return (
    <View className="gap-3">
      <View className="mb-4">
        <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found!
        </Text>
      </View>
      <View className="gap-2">
        {recipes.map((recipe) => (
          <RecipeListItem
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
          />
        ))}
      </View>
    </View>
  )
}
