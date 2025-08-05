"use client"

import { useEffect, useState } from 'react'

interface HydrationWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationWrapper({ children, fallback }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Use a small delay to ensure client-side rendering is complete
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated) {
    return <div suppressHydrationWarning>{fallback || null}</div>
  }

  return <div suppressHydrationWarning>{children}</div>
}