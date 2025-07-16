import { View, Text } from 'react-native'
import { useAppSelector } from '@/store/hooks'

export default function Hello() {
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  )

  if (isLoading) {
    return (
      <View className="py-6">
        <Text className="text-black dark:text-white text-lg">Loading...</Text>
      </View>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <View className="py-6">
        <Text className="text-black dark:text-white text-lg">
          Please sign in to continue
        </Text>
      </View>
    )
  }

  return (
    <View className="py-6">
      <Text className="text-black dark:text-white text-3xl font-bold">
        Welcome {user.firstName} {user.lastName}
      </Text>
    </View>
  )
}
