import { View, Text } from 'react-native'
import { useEffect, useCallback } from 'react'
import { secureStorage } from '@/lib/secureStorage'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setLoading, login } from '@/store/features/auth/authSlice'

export default function Hello() {
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  )
  const dispatch = useAppDispatch()

  const restoreUserSession = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      const storedUser = await secureStorage.getUserData()
      const token = await secureStorage.getAppToken()
      const isTokenExpired = await secureStorage.isTokenExpired()
      if (!storedUser) {
        console.error('No user data found')
        return
      }
      if (storedUser && token && !isTokenExpired) {
        dispatch(login(storedUser))
      }
    } catch (error) {
      console.error('Error restoring user session:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  useEffect(() => {
    restoreUserSession()
  }, [restoreUserSession])

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
