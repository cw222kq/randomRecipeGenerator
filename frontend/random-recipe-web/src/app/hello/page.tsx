'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { login, setLoading } from '@/store/features/auth/authSlice'
import Spinner from '@/components/common/Spinner'
import { toast } from 'react-toastify'

export default function Hello() {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState<boolean>(false)

  useEffect(() => {
    const setLoggedInUser = async () => {
      try {
        dispatch(setLoading(true))
        setError(null)
        const loggedInUser: User | null = await getLoggedInUser()
        console.log('request logged in user!!!!!')
        if (loggedInUser === null) {
          return
        }
        dispatch(login(loggedInUser))
        toast.info(`Hello, Welcome ${loggedInUser.firstName}!`)
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('An error occurred while fetching the user data')
      } finally {
        dispatch(setLoading(false))
        setHasChecked(true)
      }
    }

    if (user === null && !hasChecked && !isLoading) {
      setLoggedInUser()
    }
  }, [user, dispatch, hasChecked, isLoading])

  return (
    <div className="py-6">
      {/* Todo: Add a toast!!! */}
      {error && <div className="mb-8 text-red-500">{error}</div>}
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
