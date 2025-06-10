import { Pressable, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import GoogleIcon from '@/components/icons/GoogleIcon'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'
import { useRouter } from 'expo-router'
import * as Updates from 'expo-updates'

const GoogleSignInButton = () => {
  const router = useRouter()

  const handlePress = async () => {
    console.log('Google Sign In pressed')

    try {
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
      const result = await WebBrowser.openAuthSessionAsync(
        response.authUrl,
        'randomrecipe://auth',
      )

      console.log('WebBrowser result:', result)

      if (result.type === 'success') {
        console.log('OAuth redirect URL:', result.url)
        const success = await handleOAuthCallback(result.url)
        if (!success) {
          console.error('Failed to handle OAuth callback')
          return
        }

        // Store that we should redirect to hello after reload REMOVE THIS
        await secureStorage.setItem('post_login_redirect', '/hello')

        if (__DEV__) {
          Updates.reloadAsync()
        } else {
          router.push('/hello')
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled OAuth flow')
      } else {
        console.error('Unknown WebBrowser result type:', result.type)
        console.error('Failed to complete OAuth flow:', result)
      }
    } catch (error) {
      console.error('Error during OAuth flow:', error)
      await secureStorage.deleteItem('oauth_state')
    }
  }

  const handleOAuthCallback = async (callbackUrl: string): Promise<boolean> => {
    try {
      const { queryParams } = Linking.parse(callbackUrl)
      const { code, state } = queryParams as { code?: string; state?: string }

      console.log('Parsed callback - Code', code, 'State:', state)

      if (!code || !state) {
        console.error('Missing code or state in callback URL')
        return false
      }

      const storedState = await secureStorage.getItem('oauth_state')
      if (state !== storedState) {
        console.error('Ivalid OAuth state - possible CSRF attempt')
        await secureStorage.deleteItem('oauth_state')
        return false
      }

      const authResult = await authService.completeAuth({
        code,
        state,
        redirectUri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-callback`,
      })

      if (authResult === null) {
        console.error('Failed to complete authentication')
        return false
      }

      console.log('Authentication successful', authResult)

      console.log('Auth result:', authResult)

      await secureStorage.setAppToken(authResult.token, authResult.expiresAt)
      await secureStorage.setUserData(authResult.user)

      await secureStorage.deleteItem('oauth_state')

      console.log('Authentication completed and stored successfully')
      return true
    } catch (error) {
      console.error('Error handling OAuth callback:', error)
      await secureStorage.deleteItem('oauth_state')
      return false
    }
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
