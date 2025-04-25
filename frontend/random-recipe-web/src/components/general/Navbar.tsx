import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FoodLogo from '@/components/icons/FoodLogo'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-100 py-5">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="flex items-center gap-x-1 text-3xl font-semibold">
            Recipe
            <FoodLogo />
            <span className="text-blue-500">Finder</span>
          </h1>
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

      <div className="flex items-center gap-4">
        <Button className="cursor-pointer transition-all ease-in-out hover:scale-110">
          Login
        </Button>
        <Button
          className="cursor-pointertransition-all ease-in-out hover:scale-110"
          variant="secondary"
        >
          Sign up
        </Button>
      </div>
    </nav>
  )
}
