import { View, Text, TouchableOpacity } from 'react-native'
import { Link, usePathname } from 'expo-router'
import { useAppSelector } from '@/store/hooks'
import { Ionicons } from '@expo/vector-icons'

export default function BottomTabBar() {
  const { user } = useAppSelector((state) => state.auth)
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isHelloPage = pathname === '/hello'

  return (
    <View className="flex-row items-center justify-around border-t border-gray-200 bg-white py-3 dark:border-gray-700 dark:bg-gray-900">
      {/* Home */}
      <Link href="/" asChild>
        <TouchableOpacity className="items-center">
          <Ionicons
            name={isHomePage ? 'home' : 'home-outline'}
            size={24}
            color={isHomePage ? '#3b82f6' : '#64748b'}
          />

          <Text
            className={`text-xs mt-1 ${isHomePage ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Home
          </Text>
        </TouchableOpacity>
      </Link>

      {/* My Page */}
      {user && (
        <Link href="/hello" asChild>
          <TouchableOpacity className="items-center">
            <Ionicons
              name={isHelloPage ? 'person' : 'person-outline'}
              size={24}
              color={isHelloPage ? '#3b82f6' : '#6b7280'}
            />

            <Text
              className={`text-xs mt-1 ${isHelloPage ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              My Page
            </Text>
          </TouchableOpacity>
        </Link>
      )}
    </View>
  )
}
