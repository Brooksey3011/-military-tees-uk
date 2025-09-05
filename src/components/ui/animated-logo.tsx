'use client'

import { motion } from 'framer-motion'
import { OptimizedImage } from './optimized-image'

interface AnimatedLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function AnimatedLogo({ src, alt, width, height, className }: AnimatedLogoProps) {
  return (
    <motion.div
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
        className="opacity-40 select-none"
      />
    </motion.div>
  )
}