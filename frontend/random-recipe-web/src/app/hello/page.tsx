'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { login } from '@/store/features/auth/authSlice'
import Spinner from '@/components/common/Spinner'

export default function Hello() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const setLoggedInUser = async () => {
      setIsLoading(true)
      const loggedInUser: User | null = await getLoggedInUser()
      console.log('request logged in user!!!!!')
      if (loggedInUser === null) {
        setIsLoading(false)
        return
      }
      dispatch(login(loggedInUser))
      setIsLoading(false)
    }
    if (user === null) {
      setLoggedInUser()
    }
  }, [user, dispatch])

  return (
    <div className="py-6">
      {isLoading && <Spinner />}
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
