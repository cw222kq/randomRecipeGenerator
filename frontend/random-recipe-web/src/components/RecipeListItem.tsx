import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'

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
          <div className="flex-shrink-0">
            {recipe.imageUrl && (
              <Image
                src={
                  'https://media.istockphoto.com/id/513694246/sv/foto/cocoa-and-coconut-energy-balls.jpg?s=1024x1024&w=is&k=20&c=ZNAZGmFV4mF6DtpY7SR0Ni4F6mmzpOGRyJAE1p_gpK8='
                }
                alt={recipe.title}
                className="rounded-xl object-cover shadow-md"
                width={80}
                height={80}
              />
            )}
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
