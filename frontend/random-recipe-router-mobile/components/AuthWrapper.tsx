import { useAuthRestore } from '@/hooks/useAuthRestore'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthRestore()
  return <>{children}</>
}
