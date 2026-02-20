import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { Recipe } from '@/schemas/recipeSchema'

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
  if (!recipe) {
    return null
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
          <Text className="flex-1 text-xl font-bold text-black dark:text-white">
            {recipe.title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="ml-4 rounded-full bg-gray-100 p-2 dark:bg-gray-800"
          >
            <Text className="text-lg text-gray-600 dark:text-gray-300">✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
