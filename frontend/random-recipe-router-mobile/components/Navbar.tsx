import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import RecipeGeneratorLogo from './icons/RecipeGeneratorLogo'
export const Navbar = () => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-5">
      <RecipeGeneratorLogo />

      <View className="flex-row items-center gap-6">
        <Link href="/">
          <Text className="text-black dark:text-white">Home</Text>
        </Link>
        <Link href="/hello">
          <Text className="text-black dark:text-white">Another Page</Text>
        </Link>
      </View>
    </View>
  )
}
