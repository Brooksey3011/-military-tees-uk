"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  productId: string
  customerId: string
  productName: string
  orderId?: string
  onSubmit?: (reviewData: any) => void
  onCancel?: () => void
  className?: string
}

export function ReviewForm({
  productId,
  customerId,
  productName,
  orderId,
  onSubmit,
  onCancel,
  className
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} not allowed. Only JPEG, PNG, and WebP are supported.`)
        return
      }
      if (file.size > maxFileSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }
    }

    if (photos.length + fileArray.length > 5) {
      setError('Maximum 5 photos allowed per review')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('customer_id', customerId)
      
      fileArray.forEach((file, index) => {
        formData.append(`photo_${index}`, file)
      })

      const response = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setPhotoUrls(prev => [...prev, ...result.photo_urls])
        setPhotos(prev => [...prev, ...fileArray])
      } else {
        setError(result.error || 'Failed to upload photos')
      }
    } catch (error) {
      setError('Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (comment.length < 10) {
      setError('Review comment must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const reviewData = {
        product_id: productId,
        customer_id: customerId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        photo_urls: photoUrls,
        order_id: orderId
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        onSubmit?.(reviewData)
      } else {
        setError(result.error || 'Failed to submit review')
      }
    } catch (error) {
      setError('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold mb-2">Review Submitted!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for your review. It will be published after our team reviews it for quality and authenticity.
          </p>
          <Button onClick={onCancel}>
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="font-display">Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {productName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Overall Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={cn(
                    "p-1 transition-colors",
                    (hoveredRating >= star || rating >= star)
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  )}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  rating === 5 ? 'Excellent' :
                  rating === 4 ? 'Very Good' :
                  rating === 3 ? 'Good' :
                  rating === 2 ? 'Fair' : 'Poor'
                )}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Review Title (Optional)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
              className="rounded-none border-2"
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Your Review *
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this product..."
              className="rounded-none border-2 min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/2000 characters (minimum 10)
            </p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Add Photos (Optional)</label>
            <p className="text-xs text-muted-foreground">
              Share photos of the product to help other customers. Maximum 5 photos, 5MB each.
            </p>
            
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <label className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded cursor-pointer transition-colors",
                isUploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}>
                <Upload className="h-4 w-4" />
                <span className="text-sm">
                  {isUploading ? 'Uploading...' : 'Upload Photos'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                  disabled={isUploading || photos.length >= 5}
                />
              </label>
              
              {photos.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {photos.length}/5 photos
                </span>
              )}
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Notice */}
          {orderId && (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Purchase</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                This review will be marked as a verified purchase.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || rating === 0}
              className="flex-1 rounded-none font-display font-bold tracking-wide uppercase"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 rounded-none border-2 font-display font-bold tracking-wide uppercase"
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By submitting this review, you agree to our review guidelines and confirm that this review is based on your genuine experience with the product.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}