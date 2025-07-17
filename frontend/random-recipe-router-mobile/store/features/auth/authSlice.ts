import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialReduxAuthState } from '@/schemas/authSchemas'
import { User } from '@/schemas/userSchema'

const authSlice = createSlice({
  name: 'auth',
  initialState: initialReduxAuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { login, logout, setLoading, setError, clearError } =
  authSlice.actions
export default authSlice.reducer
