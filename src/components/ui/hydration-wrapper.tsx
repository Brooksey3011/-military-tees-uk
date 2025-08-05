"use client"

import { useEffect, useState } from 'react'

interface HydrationWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationWrapper({ children, fallback }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return fallback || null
  }

  return <>{children}</>
}