import authService from '@/services/authService'

global.fetch = jest.fn()

describe('authService', () => {
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
    it('should successfully call mobile-auth-init endpoint and return OAuth URL and state', async () => {
      // Arrange - Setup test data
      const mockResponse = {
        authUrl: 'https://accounts.google.com/oauth2/auth?client_id=test',
        state: 'mock-state-123',
      }

      // Mock successful API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockResponse,
      })

      // Act -Call the method that is being tested
      const result = await authService.initializeAuth()

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
    })

    it('should return null when API request fails', async () => {
      // Arrange - Mock failed API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      // Act - Call the method that is being tested
      const result = await authService.initializeAuth()

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

    it('should handle invalid response data gracefully', async () => {
      // Arrange - Setup invalid response data
      const mockResponse = {
        authUrl: 'invalid-url',
        // Missing required state field
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockResponse,
      })

      // Act - Call the method that is being tested
      const result = await authService.initializeAuth()

      // Assert - handle validation error gracefully
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid response data from initializeAuth',
        expect.any(Object),
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
        expiresAt: '2025-01-30T10:30:00.000Z',
      }

      // Mock successful API response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockResponse,
      })

      // Act - Call the method that is being tested
      const result = await authService.completeAuth(mockRequest)

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
    })

    it('should return null when API request fails', async () => {
      // Arrange
      const mockRequest = {
        code: 'mock-code',
        state: 'mock-state',
        redirectUri: 'https://mock-redirect-uri.com',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      // Act - Call the method that is being tested
      const result = await authService.completeAuth(mockRequest)

      // Assert - Verify the result
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to complete authentication',
        500,
      )
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
    })

    it('should handle invalid response data gracefully', async () => {
      // Arrange - Setup invalid response data
      const mockRequest = {
        code: 'mock-code',
        state: 'mock-state',
        redirectUri: 'https://mock-redirect-uri.com',
      }

      const mockInvalidResponse = {
        user: {
          googleUserId: 'mock-google-user-id',
          email: 'invalid-email',
          firstName: 'Mock',
          lastName: 'User',
        },
        token: 'mock-token',
        // missing expiresAt field
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockInvalidResponse,
      })

      // Act - Call the method that is being tested
      const result = await authService.completeAuth(mockRequest)

      // Assert - handle validation error gracefully
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid response data from completeAuth',
        expect.any(Object),
      )
    })
  })
})
