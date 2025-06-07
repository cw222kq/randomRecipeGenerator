import { User, UserSchema } from '@/schemas/userSchema'
import * as SecureStore from 'expo-secure-store'

const KEYS = {
  APP_TOKEN: 'app_auth_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
} as const

export const secureStorage = {
  // Store authentication token from the backend
  async setAppToken(token: string, expireAt?: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.APP_TOKEN, token)
    if (expireAt) {
      await SecureStore.setItemAsync(KEYS.TOKEN_EXPIRY, expireAt)
    }
  },

  async getAppToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.APP_TOKEN)
  },

  async isTokenExpired(): Promise<boolean> {
    const expiry = await SecureStore.getItemAsync(KEYS.TOKEN_EXPIRY)
    if (!expiry) {
      return false
    }
    return new Date(expiry) <= new Date()
  },

  // Store user profile data from the backend
  async setUserData(userData: User): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(userData))
  },

  async getUserData(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(KEYS.USER_DATA)
    if (!userData) {
      return null
    }
    try {
      const parsedUserData = JSON.parse(userData)
      const validatedUserData = UserSchema.safeParse(parsedUserData)

      if (!validatedUserData.success) {
        console.error(
          'User validation failed:',
          validatedUserData.error.format(),
        )
        await SecureStore.deleteItemAsync(KEYS.USER_DATA)
        return null
      }
      return validatedUserData.data
    } catch (error) {
      console.error('Error parsing user data:', error)
      await SecureStore.deleteItemAsync(KEYS.USER_DATA)
      return null
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.APP_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_DATA),
      SecureStore.deleteItemAsync(KEYS.TOKEN_EXPIRY),
    ])
  },
}
