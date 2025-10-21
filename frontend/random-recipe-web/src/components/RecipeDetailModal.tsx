import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
}: RecipeDetailModalProps) {
  if (!isOpen || !recipe) {
    return null
  }
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{recipe.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              X
            </Button>
          </CardHeader>
          <CardContent>
            <p>The recipe information</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
