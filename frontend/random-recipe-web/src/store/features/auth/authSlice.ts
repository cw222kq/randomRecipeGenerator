import { createSlice } from '@reduxjs/toolkit'
import { initialAuthState } from '../../../schemas/authStateSchema'

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {},
})

export default authSlice.reducer
