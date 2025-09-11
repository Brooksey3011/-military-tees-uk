"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Verified, 
  Camera, 
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Review, ReviewSummary } from '@/lib/reviews/reviews-service'

interface ReviewDisplayProps {
  productId: string
  initialReviews?: Review[]
  initialSummary?: ReviewSummary
  currentUserId?: string
  className?: string
}

export function ReviewDisplay({ 
  productId, 
  initialReviews = [], 
  initialSummary,
  currentUserId,
  className 
}: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [summary, setSummary] = useState<ReviewSummary | null>(initialSummary || null)
  const [loading, setLoading] = useState(!initialReviews.length && !initialSummary)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | undefined>()
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [showPhotosOnly, setShowPhotosOnly] = useState(false)
  const [expandedPhotoReview, setExpandedPhotoReview] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    if (!initialReviews.length && !initialSummary) {
      loadReviewData()
    }
  }, [productId])

  const loadReviewData = async () => {
    setLoading(true)
    try {
      const [reviewsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/reviews?product_id=${productId}&page=0&limit=10&sortBy=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}${showVerifiedOnly ? '&verified_only=true' : ''}${showPhotosOnly ? '&with_photos=true' : ''}`),
        fetch(`/api/reviews/${productId}/summary`)
      ])

      const [reviewsData, summaryData] = await Promise.all([
        reviewsResponse.json(),
        summaryResponse.json()
      ])

      if (reviewsData.success) {
        setReviews(reviewsData.data.reviews)
        setHasMore(reviewsData.data.reviews.length === 10)
        setPage(0)
      }

      if (summaryData.success) {
        setSummary(summaryData.data)
      }
    } catch (error) {
      console.error('Failed to load review data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreReviews = async () => {
    if (!hasMore || loading) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const response = await fetch(`/api/reviews?product_id=${productId}&page=${nextPage}&limit=10&sortBy=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}${showVerifiedOnly ? '&verified_only=true' : ''}${showPhotosOnly ? '&with_photos=true' : ''}`)
      const data = await response.json()

      if (data.success) {
        setReviews(prev => [...prev, ...data.data.reviews])
        setPage(nextPage)
        setHasMore(data.data.reviews.length === 10)
      }
    } catch (error) {
      console.error('Failed to load more reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    setPage(0)
    setReviews([])
    loadReviewData()
  }

  const markHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          helpful,
          user_id: currentUserId
        })
      })

      if (response.ok) {
        // Update the review helpfulness counts locally
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? {
                ...review,
                helpful_count: helpful ? review.helpful_count + 1 : review.helpful_count,
                not_helpful_count: !helpful ? review.not_helpful_count + 1 : review.not_helpful_count
              }
            : review
        ))
      }
    } catch (error) {
      console.error('Failed to mark review helpful:', error)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              "fill-current",
              star <= rating ? "text-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!summary) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary.rating_distribution[rating as keyof typeof summary.rating_distribution]
          const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading && !reviews.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Review Summary */}
      {summary && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{summary.average_rating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(summary.average_rating), 'lg')}
                  </div>
                  <p className="text-muted-foreground">
                    Based on {summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  {summary.verified_purchase_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Verified className="h-4 w-4 text-green-500" />
                      <span>{summary.verified_purchase_count} verified</span>
                    </div>
                  )}
                  {summary.photo_review_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span>{summary.photo_review_count} with photos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                <h4 className="font-medium">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showVerifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowVerifiedOnly(!showVerifiedOnly)
              handleFilterChange()
            }}
          >
            <Verified className="h-4 w-4 mr-1" />
            Verified Only
          </Button>
          
          <Button
            variant={showPhotosOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowPhotosOnly(!showPhotosOnly)
              handleFilterChange()
            }}
          >
            <Camera className="h-4 w-4 mr-1" />
            With Photos
          </Button>

          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterRating(filterRating === rating ? undefined : rating)
                handleFilterChange()
              }}
              aria-label={`Filter by ${rating} star reviews`}
            >
              {rating} <Star className="h-3 w-3 ml-1 fill-current" />
            </Button>
          ))}
        </div>

        <Select value={sortBy} onValueChange={(value: any) => {
          setSortBy(value)
          handleFilterChange()
        }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="rating_high">Highest Rated</SelectItem>
            <SelectItem value="rating_low">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="font-medium">{review.customer_name}</span>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="h-3 w-3 mr-1 text-green-500" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-medium text-lg">{review.title}</h4>
                )}

                {/* Review Comment */}
                <p className="text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>

                {/* Review Photos */}
                {review.photo_urls.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {review.photo_urls.slice(0, 4).map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setExpandedPhotoReview(
                              expandedPhotoReview === review.id ? null : review.id
                            )}
                          />
                          {index === 3 && review.photo_urls.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded cursor-pointer">
                              <span className="text-white font-medium">
                                +{review.photo_urls.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Expanded Photos */}
                    {expandedPhotoReview === review.id && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded">
                        {review.photo_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded"
                          />
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPhotoReview(null)}
                          className="mt-2"
                        >
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Response */}
                {review.admin_response && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Response from Military Tees UK
                    </div>
                    <p className="text-sm text-blue-700">{review.admin_response}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {new Date(review.admin_response_date!).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Helpfulness */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Was this helpful?</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id, true)}
                      className="text-muted-foreground hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {review.helpful_count}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id, false)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {review.not_helpful_count}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground space-y-2">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p>No reviews found matching your criteria.</p>
                <p className="text-sm">Be the first to review this product!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load More Button */}
        {hasMore && reviews.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMoreReviews}
              disabled={loading}
              className="px-8"
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}