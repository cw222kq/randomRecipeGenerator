import { View, Text, TouchableOpacity } from 'react-native'
import ChevronRight from '@/components/icons/ChevronRight'

interface CollapsibleSectionProps {
  title: string
  emoji?: string
  isOpen?: boolean
  onToggle?: () => void
  children: React.ReactNode
  showContentCard?: boolean
}

export default function CollapsibleSection({
  title,
  emoji,
  isOpen,
  onToggle,
  children,
  showContentCard = true,
}: CollapsibleSectionProps) {
  return (
    <View className="mb-6">
      {/* Toggle Header Card */}
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
        accessibilityLabel={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl dark:text-white">{title}</Text>
          {emoji && <Text className="text-2xl dark:text-white">{emoji}</Text>}
        </View>
        <View style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}>
          <ChevronRight size={32} color="#6b7280" />
        </View>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isOpen && (
        <>
          {showContentCard && (
            <View className="mt-2 rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-gray-800">
              {children}
            </View>
          )}
          {!showContentCard && <View className="mt-2">{children}</View>}
        </>
      )}
    </View>
  )
}
