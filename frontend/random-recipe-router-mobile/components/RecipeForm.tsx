import { View, Text, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { User } from '@/schemas/userSchema'
import { saveRecipe } from '@/services/recipeService'

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Recipe title is required')
      return
    }
    if (formData.ingredients.length === 0) {
      Alert.alert('Error', 'At least one ingredient is required')
      return
    }
    if (!formData.instructions.trim()) {
      Alert.alert('Error', 'Cooking instructions are required')
      return
    }

    setIsSubmitting(true)

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
        Alert.alert('Success', 'Recipe saved successfully')
        resetForm()
        onRecipeCreated()
      } else {
        Alert.alert('Error', 'Failed to save recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      Alert.alert('Error', 'An error occurred while saving the recipe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {!isSubmitting && (
        <View>
          <Text className="text-lg font-semibold text-black dark:text-white">
            Create Your Recipe
          </Text>
        </View>
      )}
      {isSubmitting && (
        <View className="items-center py-4">
          <ActivityIndicator size="small" />
          <Text className="mt-2 text-gray-600 dark:text-gray-400">
            Creating recipe...
          </Text>
        </View>
      )}
    </>
  )
}
