'use client'
import { Button } from '@/components/ui/button'
import { logoutWithGoogle } from '@/services/userService'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/features/auth/authSlice'
import { useState } from 'react'

export default function SignOutButton() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleLogout = () => {
    try {
      setIsLoading(true)
      logoutWithGoogle()
      dispatch(logout())
      setIsLoading(false)
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoading(false)
    }
  }
  return (
    <Button
      onClick={() => handleLogout()}
      variant="outline"
      className="cursor-pointer"
    >
      {isLoading && 'Signing out...'}
      {!isLoading && 'Sign out'}
    </Button>
  )
}
