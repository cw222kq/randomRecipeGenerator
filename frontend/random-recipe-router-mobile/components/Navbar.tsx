import { View } from 'react-native'
import RecipeGeneratorLogo from '@/components/icons/RecipeGeneratorLogo'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import SignOutButton from '@/components/SignOutButton'
import { useAppSelector } from '@/store/hooks'

export const Navbar = () => {
  const { user, isLoading } = useAppSelector((state) => state.auth)

  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-5 dark:border-gray-700">
      <RecipeGeneratorLogo />

      <View className="flex-row items-center gap-6">
        {/* When logged out => Google Sign In Button */}
        {!user && <GoogleSignInButton />}
        {!isLoading && user && <SignOutButton />}
      </View>
    </View>
  )
}
