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
        className={`... ${showConfirmation ? 'bg-red-500' : 'bg-white'} flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded`}
      >
        <View className="mr-3">
          {isLoading && <ActivityIndicator size="small" color="#dc2626" />}
        </View>

        <Text className={'text-gray-700'}>
          {isLoading
            ? 'Signing out...'
            : showConfirmation
              ? 'Tap again to confirm'
              : 'Sign Out'}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-red-500 text-sm mt-2 text-center">{error}</Text>
      )}
    </View>
  )
}
