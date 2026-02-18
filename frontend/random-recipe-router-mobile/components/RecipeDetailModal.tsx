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
        <Text className="text-xl font-bold text-black dark:text-white">
          {recipe.title}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="mt-4 rounded-lg bg-gray-200 p-3 dark:bg-gray-700"
        >
          <Text className="text-center text-black dark:text-white">Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}
