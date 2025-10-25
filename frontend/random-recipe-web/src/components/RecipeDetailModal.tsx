import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import EditIcon from '@/components/icons/EditIcon'
import DeleteIcon from '@/components/icons/DeleteIcon'

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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
            <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => {}}
                className="cursor-pointer hover:text-blue-400"
                title="Edit Recipe"
              >
                <EditIcon className="size-5" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => {}}
                className="cursor-pointer hover:text-red-400"
                title="Delete Recipe"
              >
                <DeleteIcon className="size-5" />
              </Button>

              <Button
                variant="ghost"
                onClick={onClose}
                className="cursor-pointer hover:text-blue-400"
                title="Close Recipe Details"
              >
                X
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recipe Image */}
              <div className="space-y-4">
                {recipe.imageUrl && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={
                        'https://media.istockphoto.com/id/513694246/sv/foto/cocoa-and-coconut-energy-balls.jpg?s=1024x1024&w=is&k=20&c=ZNAZGmFV4mF6DtpY7SR0Ni4F6mmzpOGRyJAE1p_gpK8='
                      }
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {!recipe.imageUrl && (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100">
                    <div className="text-center text-gray-500">
                      <span className="text-4xl">🍽️</span>
                      <p className="mt-2 text-sm">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Ingredients:
                  </h3>
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <ul className="space-y-2 pb-4 pl-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <span className="text-gray-500">•</span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!recipe.ingredients ||
                    (recipe.ingredients.length === 0 && (
                      <p className="text-gray-500">No ingredients listed</p>
                    ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Instructions:
              </h3>
              {recipe.instructions && (
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                    {recipe.instructions}
                  </p>
                </div>
              )}
              {!recipe.instructions && (
                <p className="text-gray-500">No instructions provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
