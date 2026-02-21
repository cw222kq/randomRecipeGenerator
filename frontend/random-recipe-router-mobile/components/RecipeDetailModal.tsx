import { View, Text, TouchableOpacity, Modal, Image } from 'react-native'
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
        {/* Content */}
        <View className="flex-1 px-4 py-4">
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
        </View>
      </View>
    </Modal>
  )
}
