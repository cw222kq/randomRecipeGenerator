import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Recipe } from '@/schemas/recipeSchema'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        {recipe.ingredients}
        {recipe.instructions}
        {recipe.imageUrl}
      </CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>
  )
}
