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
        <div className="flex w-full items-center justify-center border-t px-4 py-4 text-center">
          Footer
        </div>
      </CardFooter>
    </Card>
  )
}
