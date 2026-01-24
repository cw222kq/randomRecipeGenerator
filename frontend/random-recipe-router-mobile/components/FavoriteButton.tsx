import { TouchableOpacity, ActivityIndicator } from 'react-native'
import StarIcon from '@/components/icons/StarIcon'

interface FavoriteButtonProps {
  isFavorited: boolean
  onPress: () => void
  disabled?: boolean
  isLoading?: boolean
}

export default function FavoriteButton({
  isFavorited,
  onPress,
  disabled = false,
  isLoading = false,
}: FavoriteButtonProps) {
  if (isLoading) {
    return <ActivityIndicator size="small" color="#eab308" />
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={
        isFavorited ? 'Remove from favorites' : 'Add to favorites'
      }
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <StarIcon
        fill={isFavorited ? '#eab308' : 'none'}
        stroke={isFavorited ? '#eab308' : '#9ca3af'}
        size={28}
      />
    </TouchableOpacity>
  )
}
