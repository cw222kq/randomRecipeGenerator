'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@/schemas/userSchema'
import { saveRecipe } from '@/services/recipeService'
import { toast } from 'react-toastify'

interface RecipeFormProps {
  user: User
  onRecipeCreated: () => void
}

export default function RecipeForm({ user, onRecipeCreated }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [] as string[],
    currentIngredient: '',
    instructions: '',
    imageUrl: '',
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const resetForm = () => {
    setFormData({
      title: '',
      ingredients: [] as string[],
      currentIngredient: '',
      instructions: '',
      imageUrl: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    if (formData.ingredients.length === 0) {
      toast.error('Please add at least one ingredient')
      return
    }

    setIsSubmitting(true)

    /* blocking the UI for 9 seconds */
    /*const start = Date.now()
    while (Date.now() - start < 9000) {
      // Do nothing, just spin
    }*/

    try {
      const result = await saveRecipe(user.id, {
        title: formData.title.trim(),
        ingredients: formData.ingredients.map((ingredient) =>
          ingredient.trim(),
        ),
        instructions: formData.instructions.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
      })

      if (result) {
        toast.success('Recipe created successfully')
        resetForm()
        if (onRecipeCreated) {
          onRecipeCreated()
        }
      } else {
        setIsSubmitting(false)
        toast.error('Failed to create recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast.error('An error occurred while saving the recipe')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return toast.info('Creating Recipe...')
  }

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl">
          Create Your Recipe
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter recipe title"
              required
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <Label htmlFor="add-ingredient">Ingredients *</Label>

            {/* Added ingredients display */}
            {formData.ingredients.length > 0 && (
              <div className="bg-muted/50 rounded-lg border p-4">
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
                  Added Ingredients:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-secondary inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
                    >
                      {ingredient}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            ingredients: prev.ingredients.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                        className="hover:text-destructive-foreground h-4 w-4 cursor-pointer p-0"
                      >
                        ×
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Input for adding new ingredient */}
            <div className="flex gap-2">
              <Input
                id="add-ingredient"
                type="text"
                value={formData.currentIngredient}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentIngredient: e.target.value,
                  }))
                }
                placeholder="Enter ingredient (e.g., 2 cups flour)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (formData.currentIngredient.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      ingredients: [
                        ...prev.ingredients,
                        prev.currentIngredient.trim(),
                      ],
                      currentIngredient: '',
                    }))
                  }
                }}
                disabled={!formData.currentIngredient.trim()}
                className="cursor-pointer transition-all ease-in-out hover:scale-105"
              >
                Add Ingredient
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <div className="bg-muted/50 rounded-lg border p-1">
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                placeholder="Describe the cooking process step by step..."
                className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0"
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
              placeholder="https://example.com/recipe-image.jpg"
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer transition-all ease-in-out hover:scale-105"
            size="lg"
          >
            {isSubmitting ? 'Creating Recipe...' : 'Create Recipe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
