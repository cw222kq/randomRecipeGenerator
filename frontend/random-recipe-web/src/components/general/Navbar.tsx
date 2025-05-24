import Link from 'next/link'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import SignOutButton from '@/components/SignOutButton'
import RecipeGeneratorLogo from '@/components/icons/RecipeGeneratorLogo'

export default function Navbar() {
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
          <Link
            className="text-sm font-medium transition-all ease-in-out hover:scale-110 hover:text-blue-500"
            href="/hello"
          >
            <p>Another Page</p>
          </Link>
        </div>
      </div>

      <div className="hidden ease-in-out hover:scale-105 sm:flex sm:items-center">
        <GoogleSignInButton />
      </div>
      <div className="hidden ease-in-out hover:scale-105 sm:flex sm:items-center">
        <SignOutButton />
      </div>
    </nav>
  )
}
