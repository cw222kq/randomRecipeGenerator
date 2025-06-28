import { initialReduxAuthState } from '@/schemas/authSchemas'
import { User } from '@/schemas/userSchema'
import { login, logout, setLoading } from '@/store/features/auth/authSlice'
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
})
