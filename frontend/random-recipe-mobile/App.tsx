import './global.css' // Import Tailwind directives
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'

export default function App() {
  return (
    <View className="bg-white justify-center items-center h-full">
      <Text className="text-red-600 text-2xl font-bold text-center">
        Open up App.tsx to start working on your app!
      </Text>
      <StatusBar style="auto" />
    </View>
  )
}
