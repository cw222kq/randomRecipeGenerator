import { renderHook } from '@testing-library/react-native'
import { useAuthRestore } from '@/hooks/useAuthRestore'

describe('useAuthRestore', () => {
  it('should perform authentication restoration without returning state', () => {
    const { result } = renderHook(() => useAuthRestore())

    expect(result.current).toBeUndefined()
  })
})
