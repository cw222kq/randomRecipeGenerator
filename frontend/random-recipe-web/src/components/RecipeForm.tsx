'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@/schemas/userSchema'

interface RecipeFormProps {
  user: User
}

export default function RecipeForm({}: RecipeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [] as string[],
    currentIngredient: '',
    instructions: '',
    imageUrl: '',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
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
          <div>
            <Label htmlFor="ingredients">Ingredients *</Label>
            <div className="flex flex-wrap gap-2 p-2">
              <span className="text-sm">Ingredient 1</span>
            </div>

            {/* Input for adding new ingredient */}
            <div className="flex gap-2">
              <Input
                id="ingredients"
                type="text"
                value={formData.currentIngredient}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentIngredient: e.target.value,
                  }))
                }
                placeholder="Enter ingredients"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    ingredients: [
                      ...prev.ingredients,
                      prev.currentIngredient.trim(),
                    ],
                    currentIngredient: '',
                  }))
                  console.log(formData)
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              placeholder="Enter instructions"
              className="resize-none"
              required
            />
          </div>

          {/* Image URL*/}
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
              placeholder="Enter image URL"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Recipe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
