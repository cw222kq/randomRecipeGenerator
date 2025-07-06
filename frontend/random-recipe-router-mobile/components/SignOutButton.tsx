import { Pressable, Text, View } from 'react-native'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

export default function SignOutButton() {
  const { signOut } = useGoogleAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <View>
      <Pressable
        onPress={handleSignOut}
        className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded"
      >
        <Text className="text-gray-700">Sign Out</Text>
      </Pressable>
    </View>
  )
}
