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
        className="flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm"
        accessibilityLabel={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">{title}</Text>
          {emoji && <Text className="text-2xl">{emoji}</Text>}
        </View>
        <ChevronRight
          className={`h-8 w-8 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isOpen && (
        <>
          {showContentCard && (
            <View className="mt-2 rounded-lg bg-gray-50 p-4 shadow-sm">
              {children}
            </View>
          )}
          {!showContentCard && <View className="mt-2">{children}</View>}
        </>
      )}
    </View>
  )
}
