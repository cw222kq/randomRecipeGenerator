import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
} from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onDelete: (recipeId: string) => void
  onUpdate: (
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
  const [isEditing, setIsEditing] = useState(false)
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

  // Reset editing state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
    }
  }, [isOpen])

  if (!recipe) {
    return null
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
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
  }

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-gray-900 p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          {/* Recipe Title */}
          {isEditing && (
            <TextInput
              value={editData.title}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, title: text }))
              }
              className="flex-1 text-xl font-bold text-black dark:text-white border-b boder-gray-300 dark:border-gray-600 pb-1"
              placeholder="Recipe title"
              placeholderTextColor="#9ca3af"
            />
          )}
          {!isEditing && (
            <Text className="flex-1 text-xl font-bold text-black dark:text-white">
              {recipe.title}
            </Text>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <View className="ml-4 flex-row gap-4">
              <TouchableOpacity
                onPress={() => {}}
                className="rounded-full bg-green-100 p-2 dark:bg-green-900"
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelEdit}
                className="ml-2 rounded-full bg-red-100 p-2 dark:bg-red-900"
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          {!isEditing && (
            <View className="ml-4 flex-row gap-4">
              <TouchableOpacity
                onPress={handleEditClick}
                className="rounded-full bg-blue-100 p-2 dark:bg-blue-900"
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(recipe.id)}
                className="rounded-full bg-red-100 p-2 dark:bg-red-900"
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4 pb-6">
          {/* Recipe Image */}
          <View className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {recipe.imageUrl && (
              <Image
                source={{ uri: recipe.imageUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            )}
            {!recipe.imageUrl && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-4xl">🍽️</Text>
              </View>
            )}
          </View>
          {/* Ingredients */}
          <View className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <Text className="mb-3 text-lg font-semibold text-black dark:text-white">
              Ingredients:
            </Text>
            {/* Ingredients input */}
            {isEditing && (
              <View className="mb-3 flex-row">
                <TextInput
                  value={editData.currentIngredient}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      currentIngredient: text,
                    }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-black dark:border-gray-600 dark:text-white"
                  placeholder="Add an ingredient"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => {
                    if (editData.currentIngredient.trim()) {
                      setEditData((prev) => ({
                        ...prev,
                        ingredients: [
                          ...prev.ingredients,
                          prev.currentIngredient.trim(),
                        ],
                        currentIngredient: '',
                      }))
                    }
                  }}
                  className="ml-2 rounded-lg bg-blue-500 px-4 py-2"
                >
                  <Text className="text-white font-semibold">Add</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Current ingredients list (editing) */}
            {isEditing && editData.ingredients.length > 0 && (
              <View>
                {editData.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-800"
                  >
                    <Text className="flex-1 text-gray-700 dark:text-gray-300">
                      {ingredient}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditData((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }}
                      className="ml-2"
                    >
                      <Ionicons name="close-circle" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Ingredients list (read-only) */}
            {!isEditing &&
              recipe.ingredients &&
              recipe.ingredients.length > 0 &&
              recipe.ingredients.map((ingredient, index) => (
                <Text
                  key={index}
                  className="mb-1 text-gray-700 dark:text-gray-300"
                >
                  • {ingredient}
                </Text>
              ))}
            {!isEditing &&
              (!recipe.ingredients || recipe.ingredients.length === 0) && (
                <Text className="text-gray-500 dark:text-gray-400">
                  No ingredients listed
                </Text>
              )}
          </View>
          {/* Instructions */}
          <View className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <Text className="mb-3 text-lg font-semibold text-black dark:text-white">
              Instructions:
            </Text>
            {isEditing && (
              <TextInput
                value={editData.instructions}
                onChangeText={(text) =>
                  setEditData((prev) => ({ ...prev, instructions: text }))
                }
                className="text-gray-700 dark:text-gray-300 min-h-32"
                placeholder="Enter cooking instructions"
                placeholderTextColor="#9ca3af"
                multiline={true}
                textAlignVertical="top"
              />
            )}
            {!isEditing && recipe.instructions && (
              <Text className="leading-6 text-gray-700 dark:text-gray-300">
                {recipe.instructions}
              </Text>
            )}
            {!isEditing && !recipe.instructions && (
              <Text className="text-gray-500 dark:text-gray-400">
                No instructions provided
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
