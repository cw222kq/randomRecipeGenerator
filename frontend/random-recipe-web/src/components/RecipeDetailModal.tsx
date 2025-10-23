import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
            <CardTitle>{recipe.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer p-2 hover:text-gray-400"
            >
              X
            </Button>
          </CardHeader>
          <CardContent>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
