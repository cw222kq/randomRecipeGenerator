import {
  CompleteAuthResponseSchema,
  CompleteAuthResponse,
} from '@/schemas/authSchemas'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'
import * as WebBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  login,
  logout,
  setLoading,
  setError,
  clearError,
} from '@/store/features/auth/authSlice'

interface OAuthCallbackParams {
  code?: string
  state?: string
}

export const useGoogleAuth = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { isLoading, error } = useAppSelector((state) => state.auth)

  const validateOAuthCallback = async (
    params: OAuthCallbackParams,
  ): Promise<boolean> => {
    const { code, state } = params

    if (!code || !state) {
      console.error('Missing code or state in callback URL')
      return false
    }

    const storedState = await secureStorage.getItem('oauth_state')

    if (state !== storedState) {
      console.error('Invalid OAuth state - possible CSRF attempt')
      await secureStorage.deleteItem('oauth_state')
      return false
    }

    return true
  }

  const completeAuthentication = async (
    params: OAuthCallbackParams,
  ): Promise<CompleteAuthResponse | null> => {
    const { code, state } = params

    if (!code || !state) {
      console.error('Missing argument in completeAuthentication')
      return null
    }

    const authResult = await authService.completeAuth({
      code,
      state,
      redirectUri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-callback`,
    })

    if (authResult === null) {
      console.error('Failed to complete authentication')
      return null
    }

    const validatedAuthResult = CompleteAuthResponseSchema.safeParse(authResult)
    if (!validatedAuthResult.success) {
      console.error('Invalid authentication result:', validatedAuthResult.error)
      return null
    }

    await Promise.all([
      secureStorage.setAppToken(authResult.token, authResult.expiresAt),
      secureStorage.setUserData(authResult.user),
      secureStorage.deleteItem('oauth_state'),
    ])

    console.log('Authentication completed and stored successfully')
    return validatedAuthResult.data
  }

  const handleOAuthCallback = async (callbackUrl: string): Promise<boolean> => {
    if (!callbackUrl) {
      console.error('No callback URL provided')
      return false
    }

    const { queryParams } = Linking.parse(callbackUrl)
    const params = queryParams as OAuthCallbackParams

    console.log('Parsed callback - Code:', params.code, 'State:', params.state)

    const isValid = await validateOAuthCallback(params)
    if (!isValid) {
      return false
    }

    const authResult = await completeAuthentication(params)
    if (!authResult) {
      return false
    }

    return true
  }

  const redirectAfterAuth = async (): Promise<void> => {
    await secureStorage.setItem('post_login_redirect', '/hello')

    if (__DEV__) {
      Updates.reloadAsync()
    } else {
      router.push('/hello')
    }
  }

  const handleAuthResult = async (
    result: WebBrowser.WebBrowserAuthSessionResult,
  ): Promise<boolean> => {
    switch (result.type) {
      case 'success':
        console.log('OAuth redirect URL:', result.url)
        const success = await handleOAuthCallback(result.url)
        if (success) {
          const userData = await secureStorage.getUserData()
          if (!userData) {
            console.error('No user data found')
            return false
          }
          dispatch(login(userData))
          dispatch(setLoading(false))
          await redirectAfterAuth()
        }
        return false

      case 'cancel':
        console.log('User cancelled OAuth flow')
        return false

      default:
        console.error('Unknown WebBrowser result type:', result.type)
        console.error('Failed to complete OAuth flow:', result)
        return false
    }
  }

  const signInWithGoogle = async () => {
    console.log('Signing in with Google')

    try {
      dispatch(setLoading(true))
      dispatch(clearError())

      // Returns Google OAuth URL and state
      const response = await authService.initializeAuth()

      if (response === null) {
        console.error('Failed to initialize authentication')
        return
      }

      await secureStorage.setItem('oauth_state', response.state)

      // Opens Google OAuth URL in browser
      // Flow: Mobile App → Google OAuth → Backend Callback → Deep Link (randomrecipe://auth?code=...&state=...)
      const result = await WebBrowser.openAuthSessionAsync(
        response.authUrl,
        'randomrecipe://auth',
      )

      // Extract the code and state from the deep link
      await handleAuthResult(result)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Error signing in with Google:', errorMessage)
      dispatch(setError(errorMessage))
      await secureStorage.deleteItem('oauth_state')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const signOut = async () => {
    try {
      dispatch(setLoading(true))
      dispatch(clearError())
      await secureStorage.clearAllAuthData()
      dispatch(logout())
      router.push('/')

      console.log('Successfully signed out')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Error signing out:', errorMessage)
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return {
    signInWithGoogle,
    signOut,
    isLoading,
    error,
  }
}
