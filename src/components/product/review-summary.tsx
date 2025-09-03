"use client"

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewSummaryProps {
  productId: string
  className?: string
}

interface ReviewStats {
  averageRating: number | null
  totalReviews: number
}

export function ReviewSummary({ productId, className }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: null,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviewStats() {
      if (!productId) return
      
      try {
        const response = await fetch(`/api/reviews?product_id=${productId}&page=1&limit=1`)
        if (response.ok) {
          const data = await response.json()
          setStats({
            averageRating: data.averageRating,
            totalReviews: data.totalReviews || 0
          })
        }
      } catch (error) {
        console.error('Error fetching review stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewStats()
  }, [productId])

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  // Don't show anything if no reviews
  if (stats.totalReviews === 0) {
    return null
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {stats.averageRating && renderStars(stats.averageRating)}
      <span className="text-sm text-muted-foreground">
        {stats.averageRating ? (
          `(${stats.averageRating.toFixed(1)}/5 from ${stats.totalReviews} review${stats.totalReviews !== 1 ? 's' : ''})`
        ) : (
          `(${stats.totalReviews} review${stats.totalReviews !== 1 ? 's' : ''})`
        )}
      </span>
    </div>
  )
}