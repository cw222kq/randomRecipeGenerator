import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import GoogleIcon from '@/components/icons/GoogleIcon'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

const GoogleSignInButton = () => {
  const { signInWithGoogle, isLoading, error } = useGoogleAuth()

  const handlePress = async () => {
    await signInWithGoogle()
  }

  return (
    <View>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded-full dark:bg-gray-800 dark:border-gray-600"
      >
        <View className="mr-3">
          {isLoading && <ActivityIndicator size="small" color="#4285f4" />}
          {!isLoading && <GoogleIcon />}
        </View>

        <Text className="text-gray-700 dark:text-gray-200">
          {isLoading && 'Signing in...'}
          {!isLoading && 'Sign in'}
        </Text>
      </Pressable>
      {error && (
        <Text className="text-red-500 text-sm mt-2 text-center">{error}</Text>
      )}
    </View>
  )
}

export default GoogleSignInButton
