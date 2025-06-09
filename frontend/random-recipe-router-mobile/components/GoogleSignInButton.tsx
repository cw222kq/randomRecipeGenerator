import { Pressable, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import GoogleIcon from '@/components/icons/GoogleIcon'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'

const GoogleSignInButton = () => {
  const handlePress = async () => {
    console.log('Google Sign In pressed')

    const response = await authService.initializeAuth()
    console.log('Initialize auth response:', response)

    if (response === null) {
      console.error('Failed to initialize authentication')
      return
    }

    console.log('Full OAuth URL:', response.authUrl)
    console.log('OAuth state:', response.state)

    await secureStorage.setItem('oauth_state', response.state)
    const canOpen = await Linking.canOpenURL(response.authUrl)
    console.log('can open:', canOpen)
    await WebBrowser.openAuthSessionAsync(
      response.authUrl,
      'randomrecipe://auth',
    )
  }

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded"
    >
      <View className="mr-3">
        <GoogleIcon />
      </View>

      <Text className="text-gray-700">Sign in with Google</Text>
    </Pressable>
  )
}

export default GoogleSignInButton
