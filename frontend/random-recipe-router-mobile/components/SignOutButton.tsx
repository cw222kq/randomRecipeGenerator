import { useState } from 'react'
import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

export default function SignOutButton() {
  const { signOut, isLoading, error } = useGoogleAuth()
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSignOut = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    setShowConfirmation(false)
    await signOut()
  }

  return (
    <View>
      <Pressable
        onPress={handleSignOut}
        disabled={isLoading}
        className={`flex-row items-center pl-2 pr-4 py-2 border rounded-full ${showConfirmation ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'}`}
      >
        <View className="mr-3">
          {isLoading && <ActivityIndicator size="small" color="#dc2626" />}
        </View>

        <Text
          className={
            showConfirmation ? 'text-white' : 'text-gray-700 dark:text-gray-200'
          }
        >
          {isLoading
            ? 'Signing out...'
            : showConfirmation
              ? 'Tap to confirm'
              : 'Sign Out'}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-red-500 text-sm mt-2 text-center">{error}</Text>
      )}
    </View>
  )
}
