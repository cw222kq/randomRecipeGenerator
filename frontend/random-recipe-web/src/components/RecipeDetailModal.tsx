'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/schemas/recipeSchema'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import EditIcon from '@/components/icons/EditIcon'
import DeleteIcon from '@/components/icons/DeleteIcon'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from 'react-toastify'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onDelete: (recipeId: string) => void
  onUpdate?: (
    recipeId: string,
    recipeData: {
      title: string
      ingredients: string[]
      instructions: string
      imageUrl?: string
    },
  ) => void
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
}: RecipeDetailModalProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editData, setEditData] = useState({
    title: '',
    ingredients: [] as string[],
    instructions: '',
    imageUrl: '',
    currentIngredient: '',
  })

  // Initialize the edit data when recipe changes
  useEffect(() => {
    if (recipe) {
      setEditData({
        title: recipe.title,
        ingredients: [...recipe.ingredients],
        instructions: recipe.instructions,
        imageUrl: recipe.imageUrl || '',
        currentIngredient: '',
      })
    }
  }, [recipe])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false)
          if (recipe) {
            setEditData({
              title: recipe.title,
              ingredients: [...recipe.ingredients],
              instructions: recipe.instructions,
              imageUrl: recipe.imageUrl || '',
              currentIngredient: '',
            })
          }
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isEditing, onClose, recipe])

  if (!isOpen || !recipe) {
    return null
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset to original recipe data
    if (recipe) {
      setEditData({
        title: recipe.title,
        ingredients: [...recipe.ingredients],
        instructions: recipe.instructions,
        imageUrl: recipe.imageUrl || '',
        currentIngredient: '',
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!editData) {
      toast.error('Unable to save recipe. Please try again.')
      return
    }
    if (!editData.title.trim()) {
      toast.error('Recipe title is required')
      return
    }
    if (editData.ingredients.length === 0) {
      toast.error('At least one ingredient is required')
      return
    }
    if (!editData.instructions.trim()) {
      toast.error('Cooking instructions are required')
      return
    }
    if (onUpdate) {
      onUpdate(recipe.id, {
        title: editData.title.trim(),
        ingredients: editData.ingredients,
        instructions: editData.instructions,
        imageUrl: editData.imageUrl || '',
      })
    }
    setIsEditing(false)
  }

  const handleAddIngredient = () => {
    if (editData.currentIngredient.trim()) {
      setEditData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, editData.currentIngredient.trim()],
        currentIngredient: '',
      }))
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
            {/* Recipe Title */}
            {isEditing && (
              <Input
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="border-none p-0 text-2xl font-bold text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Recipe title"
                title="Update Recipe Title"
              />
            )}
            {!isEditing && (
              <CardTitle className="text-2xl font-bold">
                {recipe.title}
              </CardTitle>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {isEditing && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="rounded-full hover:bg-green-50 hover:text-green-600"
                    title="Save Changes"
                  >
                    ✓
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="rounded-full hover:bg-red-100 hover:text-red-600"
                    title="Cancel Edit"
                  >
                    ✕
                  </Button>
                </>
              )}
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleEditClick}
                    className="cursor-pointer hover:text-blue-400"
                    title="Edit Recipe"
                  >
                    <EditIcon className="size-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => onDelete(recipe.id)}
                    className="cursor-pointer hover:text-red-400"
                    title="Delete Recipe"
                  >
                    <DeleteIcon className="size-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-md cursor-pointer hover:text-blue-400"
                    title="Close Recipe Details"
                  >
                    X
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recipe Image */}
              <div className="space-y-4">
                {isEditing && (
                  <Input
                    value={editData.imageUrl}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="Image URL (optional)"
                    className="text-sm text-gray-400"
                    title="Update Image URL (optional)"
                  />
                )}

                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={
                      'https://media.istockphoto.com/id/513694246/sv/foto/cocoa-and-coconut-energy-balls.jpg?s=1024x1024&w=is&k=20&c=ZNAZGmFV4mF6DtpY7SR0Ni4F6mmzpOGRyJAE1p_gpK8='
                    }
                    alt={isEditing ? editData.title : recipe.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                {!(isEditing ? editData.imageUrl : recipe.imageUrl) && (
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
                  {/* Start of isEditing */}
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={editData.currentIngredient}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            currentIngredient: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddIngredient()
                          }
                        }}
                        placeholder="Add an ingredient"
                      />
                      <Button
                        type="button"
                        onClick={handleAddIngredient}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  {isEditing && editData.ingredients.length > 0 && (
                    <div className="space-y-2 text-gray-400">
                      {editData.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <span className="text-sm">{ingredient}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* End of isEditing */}
                  {!isEditing &&
                    recipe.ingredients &&
                    recipe.ingredients.length > 0 && (
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

              {isEditing && (
                <Textarea
                  value={editData.instructions}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  placeholder="Enter cooking instructions"
                  rows={8}
                  className="resize-none text-gray-400"
                />
              )}

              {!isEditing && recipe.instructions && (
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                    {recipe.instructions}
                  </p>
                </div>
              )}
              {!isEditing && !recipe.instructions && (
                <p className="text-gray-500">No instructions provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
