import { renderHook, waitFor } from '@testing-library/react-native'
import { useAuthRestore } from '@/hooks/useAuthRestore'
import { secureStorage } from '@/lib/secureStorage'

jest.mock('@/lib/secureStorage', () => ({
  secureStorage: {
    getAppToken: jest.fn(),
    isTokenExpired: jest.fn(),
    getUser: jest.fn(),
    clearAllAuthData: jest.fn(),
    getUserData: jest.fn(),
  },
}))

const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>

describe('useAuthRestore', () => {
  it('should perform authentication restoration without returning state', () => {
    const { result } = renderHook(() => useAuthRestore())

    expect(result.current).toBeUndefined()
  })

  it('should check token expiration on mount', async () => {
    // Arrange
    mockSecureStorage.getAppToken.mockResolvedValue('expired-token')
    mockSecureStorage.isTokenExpired.mockResolvedValue(true)

    // Act
    renderHook(() => useAuthRestore())

    // Assert
    await waitFor(() => {
      expect(mockSecureStorage.getAppToken).toHaveBeenCalled()
      expect(mockSecureStorage.isTokenExpired).toHaveBeenCalled()
    })
  })
})
