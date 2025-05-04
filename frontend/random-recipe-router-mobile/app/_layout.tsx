import '../global.css'
import { Slot } from 'expo-router'
import { SafeAreaView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Navbar } from '@/components/Navbar'
export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Navbar />
      <Slot />
    </SafeAreaView>
  )
}
