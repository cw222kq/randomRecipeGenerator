'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'

export default function Hello() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const setLoggedInUser = async () => {
      const loggedInUser = await getLoggedInUser()
      setUser(loggedInUser)
    }
    if (user === null) {
      setLoggedInUser()
    }
  })

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
