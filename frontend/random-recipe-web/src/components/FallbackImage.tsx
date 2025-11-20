interface FallbackImageProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function FallbackImage({ size = 'md' }: FallbackImageProps) {
  const emojiSize = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  }[size]

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  return (
    <div className="flex aspect-square h-full w-full items-center justify-center rounded-lg bg-gray-100 p-2">
      <div className="text-center text-gray-500">
        <span className={emojiSize}>🍽️</span>
        <p className={`mt-1 ${textSize}`}>No image available</p>
      </div>
    </div>
  )
}
