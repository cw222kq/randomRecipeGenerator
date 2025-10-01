'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function RecipeForm() {
  return (
    <Card>
      <CardHeader className="mx-auto w-full max-w-3xl">
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
                placeholder="Enter ingredients"
                className="flex-1"
              />
              <Button type="button" variant="secondary">
                Add
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              placeholder="Enter instructions"
              className="resize-none"
              required
            />
          </div>

          {/* Image URL*/}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input id="imageUrl" type="url" placeholder="Enter image URL" />
          </div>

          <Button type="submit" className="w-full">
            Save Recipe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
