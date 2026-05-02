import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native'
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
          {/* Title */}
          <Text className="mb-1 font-semibold text-black dark:text-white">
            Recipe Title *
          </Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
            placeholder="Enter recipe title"
            placeholderTextColor="#9ca3af"
            className="rounded-lg border border-gray-300 px-3 py-2 text-black dark:border-gray-600 dark:text-white"
          />
          {/* Ingredients */}
          <View className="mt-4">
            <Text className="mb-1 font-semibold text-black dark:text-white">
              Ingredients *
            </Text>
            {/* Added ingredients display */}
            {formData.ingredients.length > 0 && (
              <View className="mb-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <Text className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Added Ingredients:
                </Text>
                {formData.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-800"
                  >
                    <Text className="flex-1 text-gray-700 dark:text-gray-300">
                      {ingredient}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }}
                    >
                      <Text className="text-red-500 font-semibold">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {/* Input for adding new ingredient */}
            <View className="flex-row">
              <TextInput
                value={formData.currentIngredient}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, currentIngredient: text }))
                }
                placeholder="Enter ingredient"
                placeholderTextColor="#9ca3af"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-black dark:border-gray-600 dark:text-white"
              />
              <TouchableOpacity
                onPress={() => {
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
                className="ml-2 justify-center rounded-lg bg-blue-500 px-4 py-2"
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Instructions */}
          <View className="mt-4">
            <Text className="mb-1 font-semibold text-black dark:text-white">
              Instructions *
            </Text>
            <TextInput
              value={formData.instructions}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, instructions: text }))
              }
              placeholder="Describe the cooking process step by step..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="min-h-32 rounded-lg border border-gray-300 px-3 py-2 text-black dark:border-gray-600 dark:text-white"
            />
          </View>
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
