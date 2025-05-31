import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialAuthState } from '@/schemas/authStateSchema'
import { User } from '@/schemas/userSchema'

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { login, logout, setLoading } = authSlice.actions
export default authSlice.reducer
