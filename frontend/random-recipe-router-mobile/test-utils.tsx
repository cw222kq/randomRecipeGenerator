import React from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react-native'
import authReducer from '@/store/features/auth/authSlice'

export const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  })

export type TestStore = ReturnType<typeof createTestStore>

// Wrapper component (testing hooks)
export const createReduxWrapper = (store: TestStore) => {
  const ReduxWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  ReduxWrapper.displayName = 'ReduxWrapper'
  return ReduxWrapper
}

export const renderWithRedux = (
  component: React.ReactElement,
  store?: TestStore,
) => {
  const testStore = store || createTestStore()
  const Wrapper = createReduxWrapper(testStore)

  return {
    ...render(component, { wrapper: Wrapper }),
    store: testStore,
  }
}
