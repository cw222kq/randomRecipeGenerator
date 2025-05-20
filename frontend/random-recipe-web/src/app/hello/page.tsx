'use client'

import { useEffect, useState } from 'react'

interface User {
  firstName: string
  lastName: string
  email: string
}

export default function Hello() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const loggedInUser = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/user`,
          { credentials: 'include' },
        )
        const user = await loggedInUser.json()
        setUser(user)
      } catch (error) {
        console.error('Error fetching logged in user:', error)
      }
    }
    if (user === null) {
      getLoggedInUser()
    }
  }, [user])

  return (
    <div className="py-6">
      {!user && (
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          From the Hello page!!!!!!
        </h1>
      )}
      {user && (
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          Hello {user.firstName} {user.lastName}!
        </h1>
      )}
    </div>
  )
}
