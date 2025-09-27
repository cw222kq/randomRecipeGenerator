import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Recipe } from '@/schemas/recipeSchema'
import Image from 'next/image'
import { Button } from './ui/button'
import { User } from '@/schemas/userSchema'

interface RecipeCardProps {
  recipe: Recipe
  onNewRecipe: () => void
  isAuthenticated: boolean
  user: User | null
}

export default function RecipeCard({
  recipe,
  onNewRecipe,
  isAuthenticated,
}: RecipeCardProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl">{recipe.title}</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Image */}
        <div className="relative mb-4 aspect-video w-full">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            className="rounded-md object-cover"
            priority
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 768px"
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
          {isAuthenticated && (
            <Button
              className="cursor-pointer transition-all ease-in-out hover:scale-110"
              variant="secondary"
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
