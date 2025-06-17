import { store } from '@/store/index'
import { initialReduxAuthState } from '@/schemas/authSchemas'

describe('store configuration', () => {
  describe('initial state', () => {
    it('should have correct store structure', () => {
      // Act
      const state = store.getState()

      // Assert
      expect(state).toHaveProperty('auth')
      expect(state.auth).toEqual(initialReduxAuthState)
    })

    it('should have auth slice with expected properties', () => {
      // Act
      const authState = store.getState().auth

      // Assert
      expect(authState).toHaveProperty('user')
      expect(authState).toHaveProperty('isAuthenticated')
      expect(authState).toHaveProperty('isLoading')
    })
  })

  describe('store dispatch', () => {
    it('should have dispatch function', () => {
      // Assert
      expect(store.dispatch).toBeDefined()
      expect(typeof store.dispatch).toBe('function')
    })
  })
})
