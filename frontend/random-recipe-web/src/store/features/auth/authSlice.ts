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
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
