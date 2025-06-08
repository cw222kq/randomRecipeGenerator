import {
  CompleteAuthResponseSchema,
  InitializeAuthResponseSchema,
  CompleteAuthRequest,
} from '@/schemas/authSchemas'

const userService = {
  async initializeAuth() {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            redirectUri: 'randomrecipe://auth',
          }),
        },
      )

      if (!response.ok) {
        console.error('Failed to initialize authentication', response.status)
        return null
      }

      const data = await response.json()

      const validatedData = InitializeAuthResponseSchema.safeParse(data)
      if (!validatedData.success) {
        console.error(
          'Invalid response data from initializeAuth',
          validatedData.error,
        )
        return null
      }

      return validatedData.data
    } catch (error) {
      console.error('Failed to initialize authentication', error)
      return null
    }
  },

  async completeAuth(request: CompleteAuthRequest) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
      )

      if (!response.ok) {
        console.error('Failed to complete authentication', response.status)
        return null
      }

      const data = await response.json()

      const validatedData = CompleteAuthResponseSchema.safeParse(data)
      if (!validatedData.success) {
        console.error(
          'Invalid response data from completeAuth',
          validatedData.error,
        )
        return null
      }

      return validatedData.data
    } catch (error) {
      console.error('Failed to complete authentication', error)
      return null
    }
  },
}

export default userService
