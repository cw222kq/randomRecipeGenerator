import '../global.css'
import { Slot } from 'expo-router'
import { SafeAreaView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Navbar } from '@/components/Navbar'
export default function RootLayout() {
  return (
    // SafeAreaView helps avoid notches/status bars
    <SafeAreaView style={{ flex: 1 }}>
      {/* Configure the status bar */}
      <StatusBar style="auto" />
      {/* Renders the currently active child screen */}
      <Navbar />
      <Slot />
    </SafeAreaView>
  )
}
