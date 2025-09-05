'use client'

import { OptimizedImage } from './optimized-image'
import { useEffect, useState } from 'react'

interface AnimatedLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function AnimatedLogo({ src, alt, width, height, className }: AnimatedLogoProps) {
  const [motion, setMotion] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    import('framer-motion').then((mod) => {
      setMotion(mod.motion)
    }).catch(() => {
      // Framer Motion not available, component will render without animation
    })
  }, [])

  if (!isClient || !motion) {
    // Fallback for server-side rendering or when Framer Motion isn't available
    return (
      <div className={className}>
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

  const MotionDiv = motion.div

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
      animate={{ 
        opacity: [0, 0.1, 0.15, 0.1],
        scale: [0.8, 1, 1.02, 1],
        filter: ['blur(10px)', 'blur(5px)', 'blur(0px)', 'blur(2px)']
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      className={className}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="opacity-15 select-none pointer-events-none"
        priority={false}
      />
    </MotionDiv>
  )
}