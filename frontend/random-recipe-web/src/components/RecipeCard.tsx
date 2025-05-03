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

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-auto w-full rounded-t-lg object-cover"
            priority
            width={500}
            height={500}
          />
        </div>
        <div className="mt-4 rounded-lg border px-4 py-4">
          <h3 className="text-lg font-semibold">Ingredients:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          {recipe.ingredients}
        </div>
        <div className="mt-4 rounded-lg border px-4 py-4">
          <h3 className="text-lg font-semibold">Instructions:</h3>
          {recipe.instructions}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-center gap-4 border-t px-4 py-4 text-center">
          <Button className="cursor-pointer transition-all ease-in-out hover:scale-110">
            New Recipe
          </Button>
          <Button
            className="cursor-pointertransition-all ease-in-out hover:scale-110"
            variant="secondary"
          >
            Save Recipe
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
