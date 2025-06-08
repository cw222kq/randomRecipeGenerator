import userService from '@/services/userService'

global.fetch = jest.fn()

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any console logs
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initializeAuth', () => {
    it('should sucessfully call mobile-auth-init endpoint and return OAuth URL and state', async () => {
      // Arrange - Setup test data
      const mockResponse = {
        authUrl: 'https://accounts.google.com/oauth2/auth?client_id=test',
        state: 'mock-state-123',
      }

      // Mock sucssesful API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockResponse,
      })

      // Act -Call the method that is being tested
      const result = await userService.initializeAuth()

      // Assert - Verify the result
      expect(fetch).toHaveBeenCalledWith(
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
      expect(result).toEqual(mockResponse)
      expect(result.authUrl).toContain('accounts.google.com')
      expect(result.state).toBe(mockResponse.state)
    })
    it('should return null when API request fails', async () => {
      // Arrange - Mock failed API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      // Act - Call the method that is being tested
      const result = await userService.initializeAuth()

      // Assert - Verify the result
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize authentication',
        500,
      )
      expect(fetch).toHaveBeenCalledWith(
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
    })
  })

  describe('completeAuth', () => {
    it('should successfully call mobile-auth-complete endpoint and return code, state, and redirectUri', async () => {
      // Arrange - Setup test data
      const mockRequest = {
        code: 'mock-code',
        state: 'mock-state',
        redirectUri: 'https://mock-redirect-uri.com',
      }

      const mockResponse = {
        user: {
          googleUserId: 'mock-google-user-id',
          email: 'mock-email@example.com',
          firstName: 'Mock',
          lastName: 'User',
        },
        token: 'mock-token',
        expiresAt: 'mock-expires-at',
      }

      // Mock successful API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockResponse,
      })

      // Act - Call the method that is being tested
      const result = await userService.completeAuth(mockRequest)

      // Assert - Verify the result
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/account/mobile-auth-complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        },
      )
      expect(result).toEqual(mockResponse)
      expect(result.user).toEqual(mockResponse.user)
      expect(result.token).toBe(mockResponse.token)
      expect(result.expiresAt).toBe(mockResponse.expiresAt)
    })
  })
})
