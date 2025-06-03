import { User, userSchema } from '@/schemas/userSchema'
import * as SecureStore from 'expo-secure-store'

const KEYS = {
  APP_TOKEN: 'app_auth_token',
  USER_DATA: 'user_data',
} as const

export const secureStorage = {
  // Store authentication token from the backend
  async setAppToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.APP_TOKEN, token)
  },

  async getAppToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.APP_TOKEN)
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
      const validatedUserData = userSchema.safeParse(parsedUserData)

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
    ])
  },
}
