// Customer Reviews Service for Military Tees UK
// Handles review submission, moderation, and display

import { supabase } from '@/lib/supabase'
import { captureError } from '@/lib/monitoring/error-tracking'

export interface Review {
  id: string
  product_id: string
  customer_id: string
  customer_name: string
  customer_email: string
  rating: number
  title?: string
  comment: string
  photo_urls: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  not_helpful_count: number
  admin_response?: string
  admin_response_date?: string
  created_at: string
  updated_at: string
}

export interface ReviewSummary {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  verified_purchase_count: number
  photo_review_count: number
}

export interface ReviewStats {
  total_reviews: number
  pending_reviews: number
  average_rating: number
  recent_reviews: number
  flagged_reviews: number
}

export interface ReviewSubmission {
  product_id: string
  customer_id: string
  rating: number
  title?: string
  comment: string
  photo_urls?: string[]
  order_id?: string
}

class ReviewsService {

  // Submit a new review
  async submitReview(reviewData: ReviewSubmission): Promise<{ success: boolean; reviewId?: string; message: string }> {
    try {
      // Verify customer exists
      const { data: customer } = await supabase
        .from('customers')
        .select('id, user_id')
        .eq('id', reviewData.customer_id)
        .single()

      if (!customer) {
        return { success: false, message: 'Customer not found' }
      }

      // Get customer details from auth.users
      const { data: user } = await supabase
        .from('auth.users')
        .select('email, raw_user_meta_data')
        .eq('id', customer.user_id)
        .single()

      // Check if customer has already reviewed this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', reviewData.product_id)
        .eq('customer_id', reviewData.customer_id)
        .single()

      if (existingReview) {
        return { success: false, message: 'You have already reviewed this product' }
      }

      // Check if this is a verified purchase
      let isVerifiedPurchase = false
      if (reviewData.order_id) {
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('id, orders!inner(customer_id, status)')
          .eq('orders.customer_id', reviewData.customer_id)
          .eq('orders.status', 'completed')
          .eq('product_id', reviewData.product_id)
          .single()

        isVerifiedPurchase = !!orderItem
      }

      // Create review
      const { data: newReview, error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.product_id,
          customer_id: reviewData.customer_id,
          customer_name: user?.raw_user_meta_data?.full_name || 'Anonymous',
          customer_email: user?.email || '',
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          photo_urls: reviewData.photo_urls || [],
          is_verified_purchase: isVerifiedPurchase,
          is_approved: false, // Reviews require approval
          helpful_count: 0,
          not_helpful_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update product rating cache
      await this.updateProductRatingCache(reviewData.product_id)

      return {
        success: true,
        reviewId: newReview.id,
        message: 'Review submitted successfully. It will be published after moderation.'
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'submit_review', product_id: reviewData.product_id }
      })
      return { success: false, message: 'Failed to submit review' }
    }
  }

  // Get reviews for a product
  async getProductReviews(
    productId: string,
    options: {
      page?: number
      limit?: number
      sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
      rating?: number
      verified_only?: boolean
      with_photos?: boolean
    } = {}
  ): Promise<{
    reviews: Review[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const {
        page = 0,
        limit = 10,
        sortBy = 'newest',
        rating,
        verified_only = false,
        with_photos = false
      } = options

      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .eq('is_approved', true)

      // Apply filters
      if (rating) {
        query = query.eq('rating', rating)
      }

      if (verified_only) {
        query = query.eq('is_verified_purchase', true)
      }

      if (with_photos) {
        query = query.not('photo_urls', 'eq', '[]')
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'rating_high':
          query = query.order('rating', { ascending: false }).order('created_at', { ascending: false })
          break
        case 'rating_low':
          query = query.order('rating', { ascending: true }).order('created_at', { ascending: false })
          break
        case 'helpful':
          query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false })
          break
      }

      // Apply pagination
      query = query.range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        reviews: data || [],
        total: count || 0,
        page,
        limit
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_product_reviews', product_id: productId }
      })
      throw new Error('Failed to fetch product reviews')
    }
  }

  // Get review summary for a product
  async getProductReviewSummary(productId: string): Promise<ReviewSummary> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, is_verified_purchase, photo_urls')
        .eq('product_id', productId)
        .eq('is_approved', true)

      if (error) throw error

      if (!reviews || reviews.length === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verified_purchase_count: 0,
          photo_review_count: 0
        }
      }

      // Calculate statistics
      const totalReviews = reviews.length
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = Math.round((totalRating / totalReviews) * 10) / 10

      // Rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      // Count special types
      const verifiedPurchaseCount = reviews.filter(r => r.is_verified_purchase).length
      const photoReviewCount = reviews.filter(r => r.photo_urls && r.photo_urls.length > 0).length

      return {
        average_rating: averageRating,
        total_reviews: totalReviews,
        rating_distribution: distribution,
        verified_purchase_count: verifiedPurchaseCount,
        photo_review_count: photoReviewCount
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_review_summary', product_id: productId }
      })
      throw new Error('Failed to fetch review summary')
    }
  }

  // Mark review as helpful or not helpful
  async markReviewHelpful(reviewId: string, helpful: boolean, userId?: string): Promise<void> {
    try {
      // Check if user has already marked this review
      if (userId) {
        const { data: existingVote } = await supabase
          .from('review_helpfulness')
          .select('id, is_helpful')
          .eq('review_id', reviewId)
          .eq('user_id', userId)
          .single()

        if (existingVote) {
          // Update existing vote if different
          if (existingVote.is_helpful !== helpful) {
            await supabase
              .from('review_helpfulness')
              .update({ is_helpful: helpful })
              .eq('id', existingVote.id)

            // Update counters
            const increment = helpful ? 1 : -1
            const decrement = helpful ? -1 : 1

            await supabase.rpc('update_review_helpfulness', {
              review_id: reviewId,
              helpful_increment: increment,
              not_helpful_increment: decrement
            })
          }
          return
        }

        // Create new vote
        await supabase
          .from('review_helpfulness')
          .insert({
            review_id: reviewId,
            user_id: userId,
            is_helpful: helpful
          })
      }

      // Update counters
      const increment = helpful ? 1 : 0
      const notHelpfulIncrement = helpful ? 0 : 1

      await supabase.rpc('update_review_helpfulness', {
        review_id: reviewId,
        helpful_increment: increment,
        not_helpful_increment: notHelpfulIncrement
      })

    } catch (error) {
      await captureError(error as Error, {
        severity: 'low',
        tags: { operation: 'mark_review_helpful', review_id: reviewId }
      })
      throw new Error('Failed to mark review helpfulness')
    }
  }

  // Admin: Get pending reviews for moderation
  async getPendingReviews(options: {
    page?: number
    limit?: number
  } = {}): Promise<{
    reviews: Review[]
    total: number
  }> {
    try {
      const { page = 0, limit = 20 } = options

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          products!inner (
            name,
            main_image_url
          )
        `, { count: 'exact' })
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return {
        reviews: data || [],
        total: count || 0
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_pending_reviews' }
      })
      throw new Error('Failed to fetch pending reviews')
    }
  }

  // Admin: Approve or reject review
  async moderateReview(
    reviewId: string,
    approve: boolean,
    adminResponse?: string,
    adminUserId?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        is_approved: approve,
        updated_at: new Date().toISOString()
      }

      if (adminResponse) {
        updateData.admin_response = adminResponse
        updateData.admin_response_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)

      if (error) throw error

      // If approved, update product rating cache
      if (approve) {
        const { data: review } = await supabase
          .from('reviews')
          .select('product_id')
          .eq('id', reviewId)
          .single()

        if (review) {
          await this.updateProductRatingCache(review.product_id)
        }
      }

      // Log moderation action
      await supabase
        .from('review_moderation_log')
        .insert({
          review_id: reviewId,
          action: approve ? 'approved' : 'rejected',
          admin_user_id: adminUserId,
          admin_response: adminResponse,
          created_at: new Date().toISOString()
        })

    } catch (error) {
      await captureError(error as Error, {
        severity: 'high',
        tags: { operation: 'moderate_review', review_id: reviewId }
      })
      throw new Error('Failed to moderate review')
    }
  }

  // Update product rating cache
  private async updateProductRatingCache(productId: string): Promise<void> {
    try {
      const summary = await this.getProductReviewSummary(productId)

      await supabase
        .from('products')
        .update({
          average_rating: summary.average_rating,
          review_count: summary.total_reviews,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

    } catch (error) {
      console.error('Failed to update product rating cache:', error)
    }
  }

  // Get review statistics for admin dashboard
  async getReviewStats(): Promise<ReviewStats> {
    try {
      const [totalResult, pendingResult, avgRatingResult, recentResult] = await Promise.all([
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('reviews').select('rating').eq('is_approved', true),
        supabase.from('reviews').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const avgRating = avgRatingResult.data && avgRatingResult.data.length > 0
        ? avgRatingResult.data.reduce((sum, r) => sum + r.rating, 0) / avgRatingResult.data.length
        : 0

      return {
        total_reviews: totalResult.count || 0,
        pending_reviews: pendingResult.count || 0,
        average_rating: Math.round(avgRating * 10) / 10,
        recent_reviews: recentResult.count || 0,
        flagged_reviews: 0 // TODO: Implement flagging system
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_review_stats' }
      })
      throw new Error('Failed to fetch review statistics')
    }
  }

  // Upload review photos
  async uploadReviewPhotos(files: File[], customerId: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExtension = file.name.split('.').pop()
        const fileName = `review_${customerId}_${Date.now()}_${index}.${fileExtension}`
        
        const { data, error } = await supabase.storage
          .from('review-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName)

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      return uploadedUrls

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'upload_review_photos', customer_id: customerId }
      })
      throw new Error('Failed to upload review photos')
    }
  }

  // Get customer's reviews
  async getCustomerReviews(
    customerId: string,
    options: {
      page?: number
      limit?: number
    } = {}
  ): Promise<{
    reviews: Review[]
    total: number
  }> {
    try {
      const { page = 0, limit = 10 } = options

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          products!inner (
            name,
            main_image_url,
            slug
          )
        `, { count: 'exact' })
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return {
        reviews: data || [],
        total: count || 0
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_customer_reviews', customer_id: customerId }
      })
      throw new Error('Failed to fetch customer reviews')
    }
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService()

// Convenience functions
export const submitReview = (reviewData: ReviewSubmission) =>
  reviewsService.submitReview(reviewData)

export const getProductReviews = (productId: string, options?: Parameters<ReviewsService['getProductReviews']>[1]) =>
  reviewsService.getProductReviews(productId, options)

export const getProductReviewSummary = (productId: string) =>
  reviewsService.getProductReviewSummary(productId)

export const markReviewHelpful = (reviewId: string, helpful: boolean, userId?: string) =>
  reviewsService.markReviewHelpful(reviewId, helpful, userId)

export const uploadReviewPhotos = (files: File[], customerId: string) =>
  reviewsService.uploadReviewPhotos(files, customerId)

export default reviewsService