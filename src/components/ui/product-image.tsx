"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  width?: number
  height?: number
}

export function ProductImage({ 
  src, 
  alt, 
  className,
  fill,
  sizes,
  width,
  height
}: ProductImageProps) {
  const [imageError, setImageError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If no src or image failed to load, show placeholder
  if (!src || imageError) {
    return (
      <div className={cn(
        "bg-muted flex items-center justify-center text-muted-foreground",
        className
      )}>
        <div className="text-4xl">👕</div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(
          "object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}