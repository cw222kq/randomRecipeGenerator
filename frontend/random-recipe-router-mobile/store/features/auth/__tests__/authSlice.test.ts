import { initialReduxAuthState } from '@/schemas/authSchemas'
import { User } from '@/schemas/userSchema'
import {
  login,
  logout,
  setLoading,
  setError,
  clearError,
} from '@/store/features/auth/authSlice'
import { createTestStore, TestStore } from '@/test-utils'

describe('authSlice', () => {
  let store: TestStore

  beforeEach(() => {
    // Create fresh store for each test
    store = createTestStore()
  })
  describe('initial state', () => {
    it('should return the initial state', () => {
      // Act
      const state = store.getState().auth

      // Assert
      expect(state).toEqual(initialReduxAuthState)
    })
  })

  describe('login action', () => {
    it('should set the user, and isAuthenticated to true', () => {
      // Arrange
      const mockUser: User = {
        googleUserId: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      // Act
      store.dispatch(login(mockUser))
      const state = store.getState().auth

      // Assert
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should set the user, isAuthenticated to true, and clear any existing error', () => {
      // Arrange
      const mockUser: User = {
        googleUserId: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const errorMessage = 'test error'

      store.dispatch(setError(errorMessage))

      let state = store.getState().auth
      expect(state.error).toBe(errorMessage)

      // Act
      store.dispatch(login(mockUser))
      state = store.getState().auth

      // Assert
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('logout action', () => {
    it('should set the user, and isAuthenticated to false', () => {
      // Arrange
      const mockUser: User = {
        googleUserId: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      }
      store.dispatch(login(mockUser))

      // Act
      store.dispatch(logout())
      const state = store.getState().auth

      // Assert
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should clear user, set isAuthenticated to false, and clear any existing error', () => {
      // Arrange
      const mockUser: User = {
        googleUserId: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const errorMessage = 'test error'

      store.dispatch(login(mockUser))
      store.dispatch(setError(errorMessage))

      let state = store.getState().auth
      expect(state.error).toBe(errorMessage)
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)

      // Act
      store.dispatch(logout())
      state = store.getState().auth

      // Assert
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setLoading action', () => {
    it('should set the isLoading to true', () => {
      // Act
      store.dispatch(setLoading(true))
      const state = store.getState().auth

      // Assert
      expect(state.isLoading).toBe(true)
    })

    it('should set the isLoading to false', () => {
      // Act
      store.dispatch(setLoading(false))
      const state = store.getState().auth

      // Assert
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setError action', () => {
    it('should set the error message', () => {
      // Arrange
      const errorMessage = 'test error'

      // Act
      store.dispatch(setError(errorMessage))
      const state = store.getState().auth

      // Assert
      expect(state.error).toBe(errorMessage)
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('clearError action', () => {
    it('should clear the error state', () => {
      // Arrange
      const errorMessage = 'test error'
      store.dispatch(setError(errorMessage))

      let state = store.getState().auth
      expect(state.error).toBe(errorMessage)

      // Act
      store.dispatch(clearError())
      state = store.getState().auth

      // Assert
      expect(state.error).toBeNull()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })
})
