import { renderHook, act } from '@testing-library/react-native'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import authService from '@/services/authService'
import { secureStorage } from '@/lib/secureStorage'
import * as WebBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates'
import * as Linking from 'expo-linking'

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

describe('useGoogleAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with correct default state', () => {
    // Arrange - Setup test data
    const { result } = renderHook(() => useGoogleAuth())

    // Assert - Verify the result
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.signInWithGoogle).toBe('function')
  })

  it('should set loading state when signInWithGoogle is called', async () => {
    // Arrange - Setup test data
    mockAuthService.initializeAuth.mockResolvedValue({
      authUrl: 'https://mock-url.com',
      state: 'some-mock-state',
    })

    mockWebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'cancel',
    } as WebBrowser.WebBrowserAuthSessionResult)

    const { result } = renderHook(() => useGoogleAuth())

    // Act - Call the method that is being tested
    act(() => {
      result.current.signInWithGoogle()
    })

    // Assert - Verify the result
    expect(result.current.isLoading).toBe(true)

    await act(async () => {})

    expect(result.current.isLoading).toBe(false)
  })

  it('should handle error when initializeAuth fails', async () => {
    // Arrange
    const errorMessage = 'Network error'
    mockAuthService.initializeAuth.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useGoogleAuth())

    // Act
    await act(async () => {
      await result.current.signInWithGoogle()
    })

    // Assert
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
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

    const { result } = renderHook(() => useGoogleAuth())

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
    expect(result.current.error).toBe(null)
    expect(mockWebBrowser.openAuthSessionAsync).toHaveBeenCalledTimes(1)
    expect(mockLinking.parse).toHaveBeenCalledTimes(1)
    expect(mockSecureStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockAuthService.completeAuth).toHaveBeenCalledTimes(1)
    expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
      'post_login_redirect',
      '/hello',
    )
    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
