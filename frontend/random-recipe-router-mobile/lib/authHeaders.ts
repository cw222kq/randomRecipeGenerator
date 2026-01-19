import { secureStorage } from '@/lib/secureStorage'

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await secureStorage.getAppToken()
  if (!token) {
    return {}
  }
  return {
    Authorization: `Bearer ${token}`,
  }
}
