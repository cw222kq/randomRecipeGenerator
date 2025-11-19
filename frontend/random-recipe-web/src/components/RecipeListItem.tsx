import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardContent } from './ui/card'
//import Image from 'next/image'
import RecipeImageWithFallback from './RecipeImageWithFallback'

interface RecipeListItemProps {
  recipe: Recipe
  onClick: (recipeId: string) => void
}

export default function RecipeListItem({
  recipe,
  onClick,
}: RecipeListItemProps) {
  return (
    <Card
      className="group cursor-pointer border-l-4 transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => onClick(recipe.id)}
    >
      {/* Recipe image */}
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
            <RecipeImageWithFallback
              src={recipe.imageUrl}
              alt={recipe.title}
              className="object-cover"
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
        </div>
      </CardContent>
    </Card>
  )
}
