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
    <div className="space-y-3">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          {recipes.length} favorite{recipes.length !== 1 ? 's' : ''} found!
        </p>
      </div>

      <div className="space-y-2">
        {recipes.map((recipe) => (
          <FavoriteRecipeListItem
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
            onUnfavorite={onUnfavorite}
          />
        ))}
      </div>
    </div>
  )
}
