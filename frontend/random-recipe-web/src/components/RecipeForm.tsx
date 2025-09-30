'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
          <Button type="submit" className="w-full">
            Save Recipe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
