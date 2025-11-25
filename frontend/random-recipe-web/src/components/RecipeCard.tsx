'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Recipe } from '@/schemas/recipeSchema'
import { Button } from './ui/button'
import { User } from '@/schemas/userSchema'
import { useRouter } from 'next/navigation'
import StarIcon from '@/components/icons/StarIcon'
import RecipeImageWithFallback from './RecipeImageWithFallback'

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
  const router = useRouter()

  const handleSaveRecipe = async (user: User) => {
    if (!user) {
      return
    }
    router.push(`/create-recipe`)
  }

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl">
              {recipe.title}
            </CardTitle>
            <CardDescription>Description</CardDescription>
          </div>
          {isAuthenticated && user && (
            <button
              onClick={onToggleFavorite}
              disabled={isFavoriting}
              className="group ml-4 cursor-pointer transition-transform hover:scale-110 disabled:opacity-50"
              aria-label={
                isFavorited ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <StarIcon
                className={`h-6 w-6 transition-colors ${
                  isFavorited
                    ? 'fill-yellow-500 stroke-yellow-500'
                    : 'fill-none stroke-gray-400 group-hover:fill-yellow-400 group-hover:stroke-yellow-400'
                }`}
              />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Image */}
        <div className="relative mb-4 aspect-video w-full">
          <RecipeImageWithFallback
            src={recipe.imageUrl}
            alt={recipe.title}
            className="rounded-md object-cover"
            size="lg"
          />
        </div>

        {/* Ingredients */}
        <div className="mt-4 rounded-lg border px-4 py-4">
          <h3 className="mb-2 text-lg font-semibold">Ingredients:</h3>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mt-4 rounded-lg border px-4 py-4">
          <h3 className="text-lg font-semibold">Instructions:</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {recipe.instructions}
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Button
            onClick={onNewRecipe}
            className="cursor-pointer transition-all ease-in-out hover:scale-110"
          >
            New Recipe
          </Button>
          {isAuthenticated && user && (
            <Button
              className="cursor-pointer transition-all ease-in-out hover:scale-110"
              variant="secondary"
              onClick={() => handleSaveRecipe(user)}
            >
              Save Recipe
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              className="cursor-pointer transition-all ease-in-out hover:scale-110"
              variant="outline"
              disabled
            >
              Login to Save Recipe
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
