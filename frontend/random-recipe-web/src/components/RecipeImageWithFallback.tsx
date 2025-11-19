'use client'
import Image from 'next/image'
import { useState } from 'react'
import FallbackImage from './FallbackImage'

interface RecipeImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export default function RecipeImageWithFallback({
  src,
  alt,
  className,
}: RecipeImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  // If no src provided or error occurred, show FallbackImage
  if (!src || imageError) {
    return <FallbackImage />
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={handleImageError}
    />
  )
}
