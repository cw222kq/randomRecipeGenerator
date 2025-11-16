'use client'
import Image from 'next/image'
import { useState } from 'react'
import FallbackImage from './FallbackImage'

interface RecipeImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
}

export default function RecipeImageWithFallback({
  src,
  alt,
  className,
  width,
  height,
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
      width={width}
      height={height}
      onError={handleImageError}
    />
  )
}
