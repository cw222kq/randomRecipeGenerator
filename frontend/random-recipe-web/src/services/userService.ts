import { userSchema, User } from '@/schemas/userSchema'
import get from './baseService'
import validateData from '@/lib/validation'

const getLoggedInUser = async (): Promise<User | null> => {
  const loggedInUser = await get<User>(
    '/api/account/user',
    { credentials: 'include' },
    'logged in user',
  )
  return validateData(loggedInUser, userSchema, 'logged in user')
}

export default getLoggedInUser
