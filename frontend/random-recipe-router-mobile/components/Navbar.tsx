import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import FoodLogo from './icons/FoodLogo'
export const Navbar = () => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-5">
      <View className="flex-row items-center gap-1">
        <Text className="text-lg font-bold text-black dark:text-white">
          Recipe
        </Text>
        <FoodLogo />
        <Text className="text-lg font-bold text-blue-500">Finder</Text>
      </View>

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
