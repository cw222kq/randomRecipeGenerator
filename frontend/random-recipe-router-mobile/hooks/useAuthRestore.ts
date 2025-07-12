import { useEffect } from 'react'
import { secureStorage } from '@/lib/secureStorage'

export const useAuthRestore = () => {
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = await secureStorage.getAppToken()

        if (!token) {
          return
        }

        const isExpired = await secureStorage.isTokenExpired()

        if (isExpired) {
          await secureStorage.clearAllAuthData()
          return
        }
      } catch (error) {
        console.error('Error validating token:', error)
        await secureStorage.clearAllAuthData()
      }
    }
    validateToken()
  }, [])
}
