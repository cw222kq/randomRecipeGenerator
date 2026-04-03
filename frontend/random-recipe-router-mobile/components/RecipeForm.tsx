import { View, Text } from 'react-native'
import { useState } from 'react'

interface RecipeFormProps {}

export default function RecipeForm({}: RecipeFormProps) {
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
  return (
    <View>
      <Text className="text-lg font-semibold text-black dark:text-white">
        Create Your Recipe
      </Text>
    </View>
  )
}
