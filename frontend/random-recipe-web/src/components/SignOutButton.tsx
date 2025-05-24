'use client'
import { Button } from '@/components/ui/button'
import { logout } from '@/services/userService'

export default function SignOutButton() {
  return (
    <Button
      onClick={() => logout()}
      variant="outline"
      className="cursor-pointer"
    >
      Sign out
    </Button>
  )
}
