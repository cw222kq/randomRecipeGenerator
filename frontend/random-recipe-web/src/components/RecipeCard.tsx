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
import RecipeImageWithFallback from './RecipeImageWithFallback'
import FavoriteButton from './FavoriteButton'

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
            <FavoriteButton
              isFavorited={isFavorited}
              onClick={onToggleFavorite}
              disabled={isFavoriting}
            />
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
        </div>
      </CardFooter>
    </Card>
  )
}
