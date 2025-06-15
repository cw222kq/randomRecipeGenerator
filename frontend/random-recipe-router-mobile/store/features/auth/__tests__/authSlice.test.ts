import { configureStore } from '@reduxjs/toolkit'

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })
  })

  it('should return the initial state', () => {})
})
