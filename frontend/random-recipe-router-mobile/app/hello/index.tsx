import { View, Text } from 'react-native'
import { useEffect, useState } from 'react'
import { secureStorage } from '@/lib/secureStorage'
import { User } from '@/schemas/userSchema'

export default function Hello() {
  const [user, setUser] = useState<User | null>(null)

  const fetchUser = async () => {
    const user = await secureStorage.getUserData()
    setUser(user)
  }

  useEffect(() => {
    fetchUser()
  }, [])
  return (
    <View className="py-6">
      <Text className="text-black dark:text-white text-3xl font-bold">
        Welcome {user?.firstName} {user?.lastName}
      </Text>
    </View>
  )
}
