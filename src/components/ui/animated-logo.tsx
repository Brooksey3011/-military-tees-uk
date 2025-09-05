'use client'

import { OptimizedImage } from './optimized-image'
import { NoSSR } from './no-ssr'

interface AnimatedLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

function AnimatedLogoContent({ src, alt, width, height, className }: AnimatedLogoProps) {
  return (
    <div className={`${className} animate-pulse`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="opacity-15 select-none pointer-events-none"
        priority={false}
      />
    </div>
  )
}

export function AnimatedLogo(props: AnimatedLogoProps) {
  const fallback = (
    <div className={props.className}>
      <OptimizedImage
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        className="opacity-15 select-none pointer-events-none"
        priority={false}
      />
    </div>
  )

  return (
    <NoSSR fallback={fallback}>
      <AnimatedLogoContent {...props} />
    </NoSSR>
  )
}