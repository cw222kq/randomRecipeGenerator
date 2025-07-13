import { renderHook, waitFor } from '@testing-library/react-native'
import { useAuthRestore } from '@/hooks/useAuthRestore'
import { secureStorage } from '@/lib/secureStorage'
import { createTestStore, createReduxWrapper, TestStore } from '@/test-utils'

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

const mockDispatch = jest.fn()
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

describe('useAuthRestore', () => {
  let store: TestStore
  let wrapper: ReturnType<typeof createReduxWrapper>

  beforeEach(() => {
    jest.clearAllMocks()
    store = createTestStore()
    wrapper = createReduxWrapper(store)
  })

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

  it('should restore user data to Redux when valid token exists', async () => {
    // Arrange
    const mockUser = {
      googleUserId: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    mockSecureStorage.getAppToken.mockResolvedValue('valid-token')
    mockSecureStorage.isTokenExpired.mockResolvedValue(false)
    mockSecureStorage.getUserData.mockResolvedValue(mockUser)

    // Act
    renderHook(() => useAuthRestore(), { wrapper })

    // Assert
    await waitFor(() => {
      expect(mockSecureStorage.getUserData).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth/login',
          payload: mockUser,
        }),
      )
    })
  })
})
