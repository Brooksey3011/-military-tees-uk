"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Upload, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  productId: string
  productName: string
  onSubmit?: (reviewData: any) => void
  className?: string
}

interface ReviewFormData {
  displayName: string
  email: string
  rating: number
  reviewTitle: string
  reviewContent: string
  images: string[]
  videoUrl: string
}

export function ReviewForm({ productId, productName, onSubmit, className }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<ReviewFormData>({
    displayName: '',
    email: '',
    rating: 0,
    reviewTitle: '',
    reviewContent: '',
    images: [],
    videoUrl: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.rating === 0) newErrors.rating = 'Please select a rating'
    if (!formData.reviewTitle.trim()) newErrors.reviewTitle = 'Review title is required'
    if (!formData.reviewContent.trim() || formData.reviewContent.length < 10) {
      newErrors.reviewContent = 'Review content must be at least 10 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const reviewData = {
        product_id: productId,
        display_name: formData.displayName,
        email: formData.email,
        rating: formData.rating,
        review_title: formData.reviewTitle,
        review_content: formData.reviewContent,
        images: formData.images,
        video_url: formData.videoUrl || null
      }
      
      // Submit review to API
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review')
      }
      
      if (onSubmit) {
        onSubmit(reviewData)
      }
      
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Error submitting review:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit review. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock image upload - in real implementation, upload to storage
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const mockUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, mockUrl]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (isSubmitted) {
    return (
      <Card className={cn("border-2 border-green-200 rounded-none", className)}>
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <Check className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h3 className="text-lg font-display font-bold tracking-wide uppercase text-green-600 mb-2">
            Review Submitted!
          </h3>
          <p className="text-muted-foreground mb-4">
            Thank you for your review! It will be published after moderation.
          </p>
          <Button 
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                displayName: '',
                email: '',
                rating: 0,
                reviewTitle: '',
                reviewContent: '',
                images: [],
                videoUrl: ''
              })
            }}
            variant="outline"
            className="rounded-none"
          >
            Write Another Review
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-2 border-border rounded-none", className)}>
      <CardHeader>
        <CardTitle className="font-display font-bold tracking-wide uppercase">
          Write a Review
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience with {productName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    )}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-semibold">
                Display Name *
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="How should we display your name?"
                className="rounded-none"
                maxLength={50}
              />
              {errors.displayName && (
                <p className="text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="rounded-none"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Email won't be published, used for verification only
              </p>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="reviewTitle" className="text-sm font-semibold">
              Review Title *
            </Label>
            <Input
              id="reviewTitle"
              value={formData.reviewTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewTitle: e.target.value }))}
              placeholder="Give your review a title"
              className="rounded-none"
              maxLength={100}
            />
            {errors.reviewTitle && (
              <p className="text-sm text-red-600">{errors.reviewTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewContent" className="text-sm font-semibold">
              Review Content *
            </Label>
            <Textarea
              id="reviewContent"
              value={formData.reviewContent}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewContent: e.target.value }))}
              placeholder="Tell us about your experience with this product..."
              className="rounded-none min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formData.reviewContent.length}/1000 characters</span>
              <span>Minimum 10 characters</span>
            </div>
            {errors.reviewContent && (
              <p className="text-sm text-red-600">{errors.reviewContent}</p>
            )}
          </div>

          {/* Optional Media */}
          <div className="space-y-4">
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Optional: Add Photos or Video</h4>
              
              {/* Image Upload */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="images" className="text-sm">
                    Upload Photos (Optional)
                  </Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-16 h-16 object-cover border border-border rounded-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-sm">
                    Video URL (Optional)
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="rounded-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTube, Vimeo, or other video platform links
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          {errors.submit && (
            <div className="p-3 border border-red-200 rounded-none bg-red-50">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          >
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Reviews are subject to moderation. Please allow 24-48 hours for your review to be published.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}