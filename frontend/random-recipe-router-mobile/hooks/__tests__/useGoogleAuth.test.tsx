import { renderHook, act } from '@testing-library/react-native'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'
import * as WebBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates'
import * as Linking from 'expo-linking'
import { createTestStore, createReduxWrapper, TestStore } from '@/test-utils'
import { RootState } from '@/store'
import {
  setError,
  clearError,
  setLoading,
} from '@/store/features/auth/authSlice'

// Mock the expo-router and its push function
const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/services/authService', () => ({
  __esModule: true,
  default: {
    initializeAuth: jest.fn(),
    completeAuth: jest.fn(),
  },
}))

jest.mock('@/lib/secureStorage', () => ({
  secureStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    deleteItem: jest.fn(),
    setAppToken: jest.fn(),
    setUserData: jest.fn(),
    getUserData: jest.fn(),
    clearAllAuthData: jest.fn(),
  },
}))

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}))

jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn(),
}))

jest.mock('expo-linking', () => ({
  parse: jest.fn(),
}))

// Mock the authService and secureStorage
const mockAuthService = authService as jest.Mocked<typeof authService>
const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>
const mockWebBrowser = WebBrowser as jest.Mocked<typeof WebBrowser>
const mockUpdates = Updates as jest.Mocked<typeof Updates>
const mockLinking = Linking as jest.Mocked<typeof Linking>
const mockDispatch = jest.fn()

jest.mock('@/store/hooks', () => ({
  useAppSelector: <T,>(selector: (state: RootState) => T): T => {
    const mockState: RootState = {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    }
    return selector(mockState)
  },
  useAppDispatch: () => mockDispatch,
}))

describe('useGoogleAuth Hook', () => {
  let store: TestStore
  let wrapper: ReturnType<typeof createReduxWrapper>

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

    store = createTestStore()
    wrapper = createReduxWrapper(store)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with correct default state', () => {
    // Arrange - Setup test data
    const { result } = renderHook(() => useGoogleAuth(), {
      wrapper,
    })

    // Assert - Verify the result
    expect(result.current.isLoading).toBe(false)
    expect(typeof result.current.signInWithGoogle).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  describe('signInWithGoogle', () => {
    it('should set loading state when signInWithGoogle is called', async () => {
      // Arrange - Setup test data
      mockAuthService.initializeAuth.mockResolvedValue({
        authUrl: 'https://mock-url.com',
        state: 'some-mock-state',
      })

      mockWebBrowser.openAuthSessionAsync.mockResolvedValue({
        type: 'cancel',
      } as WebBrowser.WebBrowserAuthSessionResult)

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Act - Call the method that is being tested
      act(() => {
        result.current.signInWithGoogle()
      })

      // Assert - Verify the result
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true))

      await act(async () => {})

      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false))
    })

    it('should handle error when initializeAuth fails', async () => {
      // Arrange
      const errorMessage = 'Network error'
      mockAuthService.initializeAuth.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Act
      await act(async () => {
        await result.current.signInWithGoogle()
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(mockDispatch).toHaveBeenCalledWith(setError(errorMessage))
    })

    it('should complete successful OAuth flow', async () => {
      // Arrange
      const mockAuthResult = {
        user: {
          googleUserId: 'mock-google-user-id',
          email: 'mock-email@example.com',
          firstName: 'Mock',
          lastName: 'User',
        },
        token: 'mock-jwt-token',
        expiresAt: '2025-10-31T23:59:59.000Z',
      }

      mockAuthService.initializeAuth.mockResolvedValue({
        authUrl: 'https://mock-url.com',
        state: 'some-mock-state',
      })

      mockWebBrowser.openAuthSessionAsync.mockResolvedValue({
        type: 'success',
        url: 'https://mock-url.com?code=some-mock-code&state=some-mock-state',
      } as WebBrowser.WebBrowserAuthSessionResult)
      mockLinking.parse.mockReturnValue({
        queryParams: {
          code: 'some-mock-code',
          state: 'some-mock-state',
        } as Record<string, string>,
      } as Linking.ParsedURL)
      mockSecureStorage.getItem.mockResolvedValue('some-mock-state')
      mockAuthService.completeAuth.mockResolvedValue(mockAuthResult)

      mockSecureStorage.getUserData.mockResolvedValue({
        googleUserId: 'mock-google-user-id',
        email: 'mock-email@example.com',
        firstName: 'Mock',
        lastName: 'User',
      })

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Act
      await act(async () => {
        await result.current.signInWithGoogle()
      })

      // Assert
      expect(mockAuthService.initializeAuth).toHaveBeenCalledTimes(1)
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        'oauth_state',
        'some-mock-state',
      )
      expect(mockAuthService.completeAuth).toHaveBeenCalledWith({
        code: 'some-mock-code',
        state: 'some-mock-state',
        redirectUri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-callback`,
      })
      expect(mockSecureStorage.setAppToken).toHaveBeenCalledWith(
        'mock-jwt-token',
        '2025-10-31T23:59:59.000Z',
      )
      expect(mockSecureStorage.setUserData).toHaveBeenCalledWith({
        googleUserId: 'mock-google-user-id',
        email: 'mock-email@example.com',
        firstName: 'Mock',
        lastName: 'User',
      })
      expect(mockSecureStorage.deleteItem).toHaveBeenCalledWith('oauth_state')

      expect(result.current.isLoading).toBe(false)
      expect(mockWebBrowser.openAuthSessionAsync).toHaveBeenCalledTimes(1)
      expect(mockLinking.parse).toHaveBeenCalledTimes(1)
      expect(mockSecureStorage.getItem).toHaveBeenCalledTimes(1)
      expect(mockAuthService.completeAuth).toHaveBeenCalledTimes(1)
      expect(mockSecureStorage.setItem).toHaveBeenCalledTimes(2)
      expect(mockSecureStorage.setItem).toHaveBeenNthCalledWith(
        1,
        'oauth_state',
        'some-mock-state',
      )
      expect(mockSecureStorage.setItem).toHaveBeenNthCalledWith(
        2,
        'post_login_redirect',
        '/hello',
      )
      expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1)
      expect(mockPush).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(clearError())
    })
  })

  describe('signOut', () => {
    it('should clear auth data and navigate on signOut', async () => {
      // Arrange
      mockSecureStorage.clearAllAuthData.mockResolvedValue()

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Act
      await act(async () => {
        await result.current.signOut()
      })

      // Assert
      expect(mockSecureStorage.clearAllAuthData).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(result.current.isLoading).toBe(false)
      expect(store.getState().auth.user).toBe(null)
      expect(mockDispatch).toHaveBeenCalledWith(clearError())
    })

    it('should handle signOut errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Some error'
      mockSecureStorage.clearAllAuthData.mockRejectedValue(
        new Error(errorMessage),
      )

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Act
      await act(async () => {
        await result.current.signOut()
      })

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setError(errorMessage))
      expect(console.error).toHaveBeenCalledWith(
        'Error signing out:',
        errorMessage,
      )
    })

    it('should clear error state before attempting signOut', async () => {
      // Arrange
      const errorMessage = 'Some error'
      mockSecureStorage.clearAllAuthData.mockResolvedValue()

      const { result } = renderHook(() => useGoogleAuth(), {
        wrapper,
      })

      // Set initial error state
      mockAuthService.initializeAuth.mockRejectedValue(new Error(errorMessage))
      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(mockDispatch).toHaveBeenCalledWith(setError(errorMessage))

      // Act
      await act(async () => {
        await result.current.signOut()
      })

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(clearError())
    })
  })
})
