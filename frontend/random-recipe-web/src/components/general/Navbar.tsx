import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

      <div className="hidden gap-2 sm:flex sm:items-center sm:gap-4">
        <Button className="w-full cursor-pointer transition-all ease-in-out hover:scale-110 sm:w-auto">
          Login
        </Button>
        <Button
          className="w-full cursor-pointer transition-all ease-in-out hover:scale-110 sm:w-auto"
          variant="secondary"
        >
          Sign up
        </Button>
      </div>
    </nav>
  )
}
