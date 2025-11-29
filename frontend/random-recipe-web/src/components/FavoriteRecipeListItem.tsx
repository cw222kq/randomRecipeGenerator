import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardContent } from './ui/card'
import RecipeImageWithFallback from './RecipeImageWithFallback'
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
  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking star
    onUnfavorite(recipe.id)
  }

  return (
    <Card
      className="group cursor-pointer border-l-4 border-l-yellow-400 transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => onClick(recipe.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Recipe Image */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
            <RecipeImageWithFallback
              src={recipe.imageUrl}
              alt={recipe.title}
              className="object-cover"
              size="sm"
            />
          </div>

          {/* Recipe Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-800 transition-colors group-hover:text-gray-400">
              {recipe.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <span>🥄</span>
              {recipe.ingredients.length} ingredient
              {recipe.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Favorite Button - Always favorited in this list */}
          <FavoriteButton isFavorited={true} onClick={handleStarClick} />
        </div>
      </CardContent>
    </Card>
  )
}
