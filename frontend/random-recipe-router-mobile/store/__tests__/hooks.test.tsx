import React from 'react'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { login } from '@/store/features/auth/authSlice'
import { Provider } from 'react-redux'
import { renderHook, act } from '@testing-library/react-native'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { initialReduxAuthState } from '@/schemas/authSchemas'
import { User } from '@/schemas/userSchema'

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  })

// Wrapper component (testing hooks)
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

describe('Redux hooks', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('useAppSelector', () => {
    it('should select auth state correctly', () => {
      // Arrange
      const wrapper = createWrapper(store)

      // Act
      const { result } = renderHook(
        () => useAppSelector((state) => state.auth),
        { wrapper },
      )

      // Assert
      expect(result.current).toEqual(initialReduxAuthState)
    })
  })

  it('should update when state changes', () => {
    // Arrange
    const wrapper = createWrapper(store)
    const mockUser: User = {
      googleUserId: '123',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
    }

    // Act
    const { result } = renderHook(() => useAppSelector((state) => state.auth), {
      wrapper,
    })

    act(() => {
      store.dispatch(login(mockUser))
    })

    // Assert
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  describe('useAppDispatch', () => {
    it('should return dispatch function', () => {
      // Arrange
      const wrapper = createWrapper(store)

      // Act
      const { result } = renderHook(() => useAppDispatch(), { wrapper })

      // Assert
      expect(result.current).toBeDefined()
      expect(typeof result.current).toBe('function')
    })

    it('should dispatch actions correctly', () => {
      // Arrange
      const wrapper = createWrapper(store)
      const mockUser: User = {
        googleUserId: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      // Act
      const { result } = renderHook(() => useAppDispatch(), { wrapper })

      act(() => {
        result.current(login(mockUser))
      })

      // Assert
      const state = store.getState().auth
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })
  })
})
