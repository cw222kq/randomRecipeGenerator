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
    <div className="space-y-3">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          {recipes.length} recipe{recipes.length > 1 ? 's' : ''} found!
        </p>
      </div>

      <div className="space-y-2">
        {recipes.map((recipe) => (
          <RecipeListItem
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
          />
        ))}
      </div>
    </div>
  )
}
