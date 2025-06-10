import '../global.css'
import { Slot, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Navbar } from '@/components/Navbar'
import { secureStorage } from '@/lib/secureStorage'
import { useEffect } from 'react'

export default function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    const checkPostLoginRedirect = async () => {
      try {
        const redirectPath = await secureStorage.getItem('post_login_redirect')
        if (redirectPath) {
          await secureStorage.deleteItem('post_login_redirect')
          setTimeout(() => {
            router.push(redirectPath as any)
          }, 100) // Give app time to fully load
        }
      } catch (error) {
        console.error('Error checking post-login redirect:', error)
      }
    }

    checkPostLoginRedirect()
  }, [router])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Navbar />
      <Slot />
    </SafeAreaView>
  )
}
