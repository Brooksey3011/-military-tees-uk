"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  display_name: string
  rating: number
  review_title: string
  review_content: string
  images: string[]
  video_url?: string
  helpful_votes: number
  verified_purchase: boolean
  created_at: string
}

interface ReviewDisplayProps {
  productId: string
  className?: string
}

export function ReviewDisplay({ productId, className }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [totalReviews, setTotalReviews] = useState<number>(0)

  useEffect(() => {
    fetchReviews()
  }, [productId, page])

  const fetchReviews = async () => {
    try {
      setLoading(page === 1)
      const response = await fetch(`/api/reviews?product_id=${productId}&page=${page}&limit=5`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      
      if (page === 1) {
        setReviews(data.reviews || [])
      } else {
        setReviews(prev => [...prev, ...(data.reviews || [])])
      }
      
      setHasMore(data.hasMore || false)
      setAverageRating(data.averageRating)
      setTotalReviews(data.totalReviews || 0)
      
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              size,
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    )
  }

  if (loading && page === 1) {
    return (
      <Card className={cn('border-2 border-border rounded-none', className)}>
        <CardHeader>
          <CardTitle className="font-display font-bold tracking-wide uppercase">
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-muted/20 h-4 w-20 rounded-none"></div>
                  <div className="bg-muted/20 h-4 w-32 rounded-none"></div>
                </div>
                <div className="bg-muted/20 h-6 w-3/4 rounded-none"></div>
                <div className="bg-muted/20 h-16 w-full rounded-none"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-2 border-border rounded-none', className)}>
      <CardHeader>
        <CardTitle className="font-display font-bold tracking-wide uppercase">
          Customer Reviews
        </CardTitle>
        
        {/* Review Summary */}
        {totalReviews > 0 && averageRating && (
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating), 'h-5 w-5')}
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load reviews: {error}</p>
            <Button 
              onClick={() => fetchReviews()}
              variant="outline" 
              className="mt-4 rounded-none"
            >
              Try Again
            </Button>
          </div>
        )}

        {!error && reviews.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{review.display_name}</span>
                      {review.verified_purchase && (
                        <Badge variant="secondary" className="rounded-none text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>

                {/* Review Title */}
                <h4 className="font-semibold text-lg mb-2">{review.review_title}</h4>

                {/* Review Content */}
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {review.review_content}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-16 h-16 object-cover border border-border rounded-none"
                      />
                    ))}
                    {review.images.length > 3 && (
                      <div className="w-16 h-16 bg-muted border border-border rounded-none flex items-center justify-center text-xs text-muted-foreground">
                        +{review.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Video */}
                {review.video_url && (
                  <div className="mb-4">
                    <Badge variant="outline" className="rounded-none">
                      Video Review Available
                    </Badge>
                  </div>
                )}

                {/* Helpful Votes */}
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful ({review.helpful_votes})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center pt-6">
            <Button
              onClick={() => setPage(prev => prev + 1)}
              variant="outline"
              disabled={loading}
              className="rounded-none"
            >
              Load More Reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}