'use client'

import Link from 'next/link'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import SignOutButton from '@/components/SignOutButton'
import RecipeGeneratorLogo from '@/components/icons/RecipeGeneratorLogo'
import { useAppSelector } from '@/store/hooks'
import { useEffect, useState } from 'react'
//import Spinner from '@/components/common/Spinner'

export default function Navbar() {
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      /* TODO: Add small device menu when buttons are hidden */
      <nav className="flex items-center justify-between border-b border-gray-200 py-5">
        <div className="flex items-center gap-8">
          <Link className="transition-all ease-in-out hover:scale-105" href="/">
            <RecipeGeneratorLogo />
          </Link>
          <div className="hidden items-center gap-6 transition-colors sm:flex">
            <Link
              className="text-sm font-medium transition-all ease-in-out hover:scale-110 hover:text-blue-500"
              href="/"
            >
              <p>Home</p>
            </Link>
          </div>
        </div>
        <div className="hidden ease-in-out hover:scale-105 sm:flex sm:items-center"></div>
      </nav>
    )
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 py-5">
      <div className="flex items-center gap-8">
        <Link className="transition-all ease-in-out hover:scale-105" href="/">
          <RecipeGeneratorLogo />
        </Link>

        <div className="hidden items-center gap-6 transition-colors sm:flex">
          <Link
            className="text-sm font-medium transition-all ease-in-out hover:scale-110 hover:text-blue-500"
            href="/"
          >
            <p>Home</p>
          </Link>
          {user && (
            <Link
              className="text-sm font-medium transition-all ease-in-out hover:scale-110 hover:text-blue-500"
              href="/hello"
            >
              <p>My Page</p>
            </Link>
          )}
        </div>
      </div>

      <div className="hidden ease-in-out hover:scale-105 sm:flex sm:items-center">
        {isLoading && (
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
        )}
        {!isLoading && !user && <GoogleSignInButton />}
        {!isLoading && user && <SignOutButton />}
      </div>
    </nav>
  )
}
