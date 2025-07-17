import {
  ReduxAuthStateSchema,
  initialReduxAuthState,
} from '@/schemas/authSchemas'

describe('authSchemas', () => {
  describe('ReduxAuthStateSchema', () => {
    describe('success cases', () => {
      it('should validate logged-in state', () => {
        // Arrange
        const loggedInState = {
          user: {
            googleUserId: '123',
            email: 'mock@email.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(loggedInState)

        // Assert
        expect(result.success).toBe(true)
        expect(result.data).toEqual(loggedInState)
      })

      it('should validate logged-out state', () => {
        // Arrange
        const loggedOutState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(loggedOutState)

        // Assert
        expect(result.success).toBe(true)
        expect(result.data).toEqual(loggedOutState)
      })

      it('should validate loading state', () => {
        // Arrange
        const loadingState = {
          user: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(loadingState)

        // Assert
        expect(result.success).toBe(true)
      })
    })

    describe('failure cases', () => {
      it('should reject state with missing required fields', () => {
        // Arrange
        const invalidState = {
          user: null,
          // missing isLoading and isAuthenticated
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(invalidState)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.message).toContain('isLoading')
        expect(result.error?.message).toContain('isAuthenticated')
      })

      it('should reject state with wrong types', () => {
        // Arrange
        const invalidState = {
          user: null,
          isAuthenticated: 'not a boolean',
          isLoading: 'not a boolean',
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(invalidState)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.message).toContain('isAuthenticated')
        expect(result.error?.message).toContain('isLoading')
      })

      it('should reject state with invalid user object', () => {
        // Arrange
        const invalidState = {
          user: {
            googleUserId: '123',
            email: 'invalid-email',
            firstName: 'John',
            lastName: 'Doe',
          },
          isAuthenticated: true,
          isLoading: false,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(invalidState)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.message).toContain('email')
      })
    })

    describe('initial state', () => {
      it('should validate initial state', () => {
        // Arrange - valid initial state constant

        // Act
        const result = ReduxAuthStateSchema.safeParse(initialReduxAuthState)

        // Assert
        expect(result.success).toBe(true)
        expect(initialReduxAuthState).toEqual({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      })
    })

    describe('error cases', () => {
      it('should validate redux auth state with error', () => {
        // Arrange
        const errorMessage = 'Error message'
        const validStateWithError = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(validStateWithError)

        // Assert
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.error).toBe(errorMessage)
        }
      })

      it('should validate redux auth state with null error', () => {
        // Arrange
        const validStateWithNullError = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }

        // Act
        const result = ReduxAuthStateSchema.safeParse(validStateWithNullError)

        // Assert
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.error).toBe(null)
        }
      })

      it('should validate initial redux auth state includes error', () => {
        // Arrange & Act
        const result = ReduxAuthStateSchema.safeParse(initialReduxAuthState)

        // Assert
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.error).toBe(null)
        }
      })
    })
  })
})
