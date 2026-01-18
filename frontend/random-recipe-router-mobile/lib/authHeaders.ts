import { secureStorage } from '@/lib/secureStorage'

export const getAuthHeaders = async () => {
  const token = await secureStorage.getAppToken()
  if (!token) {
    return {}
  }
  return {
    Authorization: `Bearer ${token}`,
  }
}
