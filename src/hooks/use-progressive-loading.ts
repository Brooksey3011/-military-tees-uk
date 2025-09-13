"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface ProgressiveLoadingOptions {
  initialLoad?: number
  loadIncrement?: number
  threshold?: number
  rootMargin?: string
}

interface ProgressiveLoadingResult<T> {
  visibleItems: T[]
  loadMoreRef: (node: HTMLElement | null) => void
  isLoading: boolean
  hasMore: boolean
  loadedCount: number
  totalCount: number
  loadProgress: number
}

export function useProgressiveLoading<T>(
  items: T[],
  options: ProgressiveLoadingOptions = {}
): ProgressiveLoadingResult<T> {
  const {
    initialLoad = 12,
    loadIncrement = 8,
    threshold = 0.1,
    rootMargin = '100px'
  } = options

  const [loadedCount, setLoadedCount] = useState(initialLoad)
  const [isLoading, setIsLoading] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const loadMoreRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loadedCount < items.length) {
          setIsLoading(true)
          
          // Simulate network delay for smooth UX
          setTimeout(() => {
            setLoadedCount(prev => Math.min(prev + loadIncrement, items.length))
            setIsLoading(false)
          }, 300)
        }
      },
      { threshold, rootMargin }
    )

    if (node) observer.current.observe(node)
  }, [isLoading, loadedCount, items.length, loadIncrement, threshold, rootMargin])

  // Reset loaded count when items change
  useEffect(() => {
    setLoadedCount(Math.min(initialLoad, items.length))
  }, [items.length, initialLoad])

  // Cleanup observer
  useEffect(() => {
    const currentObserver = observer.current
    return () => {
      if (currentObserver) {
        currentObserver.disconnect()
      }
    }
  }, [])

  const visibleItems = items.slice(0, loadedCount)
  const hasMore = loadedCount < items.length
  const loadProgress = items.length > 0 ? (loadedCount / items.length) * 100 : 0

  return {
    visibleItems,
    loadMoreRef,
    isLoading,
    hasMore,
    loadedCount,
    totalCount: items.length,
    loadProgress
  }
}