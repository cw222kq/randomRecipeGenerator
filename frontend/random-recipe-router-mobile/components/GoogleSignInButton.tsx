import { Pressable, Text, View } from 'react-native'
import GoogleIcon from './icons/GoogleIcon'

const GoogleSignInButton = () => {
  return (
    <Pressable className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded">
      <View className="mr-3">
        <GoogleIcon />
      </View>

      <Text className="text-gray-700">Sign in with Google</Text>
    </Pressable>
  )
}

export default GoogleSignInButton
