import { useEffect } from 'react'
import { secureStorage } from '@/lib/secureStorage'
import { useAppDispatch } from '@/store/hooks'
import { login } from '@/store/features/auth/authSlice'

export const useAuthRestore = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = await secureStorage.getAppToken()

        if (!token) {
          console.log('No token found - user not logged in')
          return
        }

        const isExpired = await secureStorage.isTokenExpired()

        if (isExpired) {
          console.log('Token expired - clearing auth data')
          await secureStorage.clearAllAuthData()
          return
        }

        // Token is valid
        const userData = await secureStorage.getUserData()

        if (!userData) {
          await secureStorage.clearAllAuthData()
          console.error('User data not found')
          return
        }

        dispatch(login(userData))
        console.log('Auth restored:', userData.email)
        console.log('Token status: valid locally')
      } catch (error) {
        console.error('Error validating token during auth restore:', error)
        await secureStorage.clearAllAuthData()
      }
    }
    validateToken()
  }, [dispatch])
}
