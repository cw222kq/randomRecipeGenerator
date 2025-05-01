import { View, Text } from 'react-native'
import { Link } from 'expo-router'

export const Navbar = () => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-5">
      <Link href="/">
        <Text className="text-lg font-bold text-black dark:text-white">
          <Text className=" ">Recipe</Text>
          <Text className=" text-blue-500 text-center">Finder</Text>
        </Text>
      </Link>
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
