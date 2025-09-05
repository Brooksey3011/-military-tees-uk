'use client'

import { ReactNode, useEffect, useState } from 'react'

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedText({ children, className, delay = 0 }: AnimatedTextProps) {
  const [motion, setMotion] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    import('framer-motion').then((mod) => {
      setMotion(mod.motion)
    }).catch(() => {
      // Framer Motion not available
    })
  }, [])

  if (!isClient || !motion) {
    return <div className={className}>{children}</div>
  }

  const MotionDiv = motion.div

  return (
    <MotionDiv
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
    </MotionDiv>
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
  const [motion, setMotion] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    import('framer-motion').then((mod) => {
      setMotion(mod.motion)
    }).catch(() => {
      // Framer Motion not available
    })
  }, [])

  const content = href ? (
    <a href={href} className="block w-full h-full">
      {children}
    </a>
  ) : (
    <button onClick={onClick} className="w-full h-full">
      {children}
    </button>
  )

  if (!isClient || !motion) {
    return <div className={className}>{content}</div>
  }

  const MotionDiv = motion.div

  return (
    <MotionDiv
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
      {content}
    </MotionDiv>
  )
}