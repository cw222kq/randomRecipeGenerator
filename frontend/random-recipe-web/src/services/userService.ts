import { userSchema, User } from '@/schemas/userSchema'

const getLoggedInUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/user`,
      { credentials: 'include' },
    )

    if (!response.ok) {
      console.error(
        `Failed to fetch logged in user: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const user = await response.json()
    const validatedUser = userSchema.safeParse(user)

    if (!validatedUser.success) {
      console.error('User validation failed:', validatedUser.error.format())
      return null
    }

    return validatedUser.data
  } catch (error) {
    console.error('Error fetching logged in user:', error)
    return null
  }
}

export default getLoggedInUser
