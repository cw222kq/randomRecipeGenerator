import { userSchema, User } from '@/schemas/userSchema'
import get from './baseService'
import validateData from '@/lib/validation'

export const login = async (): Promise<void> => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/login-google`
}

export const logout = async (): Promise<void> => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/logout`
}

export const getLoggedInUser = async (): Promise<User | null> => {
  const loggedInUser = await get<User>(
    '/api/account/user',
    { credentials: 'include' },
    'logged in user',
  )
  return validateData(loggedInUser, userSchema, 'logged in user')
}
