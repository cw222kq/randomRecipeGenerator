import { View, Text } from 'react-native'
import { Link } from 'expo-router'

export default function BottomTabBar() {
  return (
    <View className="flex-row items-center justify-around border-t border-gray-200 bg-white py-3 dark:border-gray-700 dark:bg-gray-900">
      {/* Home */}
      <Link href="/">
        <Text className="text-black dark:text-white">Home</Text>
      </Link>

      {/* My Page */}
      <Link href="/hello">
        <Text className="text-black dark:text-white">My Page</Text>
      </Link>
    </View>
  )
}
