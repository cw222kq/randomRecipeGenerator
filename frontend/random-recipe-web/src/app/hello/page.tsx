'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/services/userService'
import { User } from '@/schemas/userSchema'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { login, setLoading } from '@/store/features/auth/authSlice'
import Spinner from '@/components/common/Spinner'
import { toast } from 'react-toastify'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import ChevronRight from '@/components/icons/ChevronRight'

export default function Hello() {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState<boolean>(false)
  const [showRecipes, setShowRecipes] = useState<boolean>(false)

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

  const handleToggleRecipes = () => {
    setShowRecipes(!showRecipes)
  }

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
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">
            Hello {user.firstName} {user.lastName}!
          </h1>

          {/* My recipies Toggle Card */}
          <Card
            className="mb-6 cursor-pointer transition-all hover:shadow-md"
            onClick={handleToggleRecipes}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">My tasty Recipies</span>
                  <span className="text-2xl">🍳</span>
                </div>
                <ChevronRight
                  className={`h-8 w-8 transition-transform duration-200 ${showRecipes ? 'rotate-90' : ''}`}
                />
              </CardTitle>
            </CardHeader>
          </Card>

          {showRecipes && (
            <Card className="mb-6 bg-gray-50">
              <CardContent className="py-8 text-center">
                <p> All my recipes will go here!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
