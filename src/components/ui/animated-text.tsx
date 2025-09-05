'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedText({ children, className, delay = 0 }: AnimatedTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.21, 1, 0.81, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  delay?: number
  href?: string
  onClick?: () => void
}

export function AnimatedButton({ children, className, delay = 0, href, onClick }: AnimatedButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.21, 1, 0.81, 1]
      }}
      className={className}
    >
      {href ? (
        <a href={href} className="block w-full h-full">
          {children}
        </a>
      ) : (
        <button onClick={onClick} className="w-full h-full">
          {children}
        </button>
      )}
    </motion.div>
  )
}