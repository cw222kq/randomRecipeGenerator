'use client'
import StarIcon from '@/components/icons/StarIcon'

interface FavoriteButtonProps {
  isFavorited: boolean
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
}

export default function FavoriteButton({
  isFavorited,
  onClick,
  disabled = false,
  className = '',
}: FavoriteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group cursor-pointer transition-transform hover:scale-110 disabled:opacity-50 ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <StarIcon
        className={`h-6 w-6 transition-colors ${
          isFavorited
            ? 'fill-yellow-500 stroke-yellow-500'
            : 'fill-none stroke-gray-400 group-hover:fill-yellow-400 group-hover:stroke-yellow-400'
        }`}
      />
    </button>
  )
}
