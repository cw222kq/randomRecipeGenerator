import { Pressable, Text, View } from 'react-native'

export default function SignOutButton() {
  return (
    <View>
      <Pressable className="flex-row items-center pl-2 pr-4 py-2 bg-white border border-gray-300 rounded">
        <Text className="text-gray-700">Sign Out</Text>
      </Pressable>
    </View>
  )
}
