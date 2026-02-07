import { View, Text, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function BottomTabBar() {
  return (
    <View className="flex-row items-center justify-around border-t border-gray-200 bg-white py-3 dark:border-gray-700 dark:bg-gray-900">
      {/* Home */}
      <Link href="/" asChild>
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#3b82f6" />

          <Text className="text-xs mt-1 text-blue-500 font-semibold">Home</Text>
        </TouchableOpacity>
      </Link>

      {/* My Page */}
      <Link href="/hello" asChild>
        <TouchableOpacity className="items-center">
          <Ionicons name="person" size={24} color="#3b82f6" />

          <Text className="text-xs mt-1 text-blue-500 font-semibold">
            My Page
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}
