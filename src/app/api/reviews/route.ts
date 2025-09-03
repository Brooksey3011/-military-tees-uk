import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { validateAndSanitize } from '@/lib/validation'
import { z } from 'zod'

const createReviewSchema = z.object({
  product_id: z.string().uuid(),
  display_name: z.string().min(2).max(50),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  review_title: z.string().min(5).max(100),
  review_content: z.string().min(10).max(1000),
  images: z.array(z.string().url()).optional(),
  video_url: z.string().url().optional()
})

const getReviewsSchema = z.object({
  product_id: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest', 'helpful']).default('newest')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = validateAndSanitize(createReviewSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid review data',
        details: validation.error
      }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', validation.data.product_id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({
        error: 'Product not found'
      }, { status: 404 })
    }

    // Create the review
    const reviewData = {
      ...validation.data,
      status: 'pending', // Reviews require approval
      helpful_votes: 0,
      verified_purchase: false, // TODO: Check if user actually purchased
      created_at: new Date().toISOString()
    }

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert(reviewData)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({
        error: 'Failed to create review'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully. It will be published after moderation.'
    })

  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryParams = {
      product_id: searchParams.get('product_id') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      sort: searchParams.get('sort') || 'newest'
    }

    const validation = validateAndSanitize(getReviewsSchema, queryParams)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid parameters',
        details: validation.error
      }, { status: 400 })
    }

    const params = validation.data
    const offset = (params.page - 1) * params.limit
    const supabase = createSupabaseAdmin()

    // Check if product_reviews table exists, return empty for now
    const { data: reviews, error, count } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .eq('product_id', params.product_id || '')
      .range(offset, offset + params.limit - 1)
      .order('created_at', { ascending: false })
    
    // If table doesn't exist, return empty results
    if (error && (error.code === 'PGRST200' || error.code === '42P01')) {
      return NextResponse.json({
        success: true,
        reviews: [],
        total: 0,
        page: params.page,
        limit: params.limit,
        hasMore: false,
        averageRating: null,
        totalReviews: 0
      })
    }

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({
        error: 'Failed to fetch reviews'
      }, { status: 500 })
    }

    // Calculate average rating if product_id is provided
    let averageRating = null
    let totalReviews = null
    
    if (params.product_id) {
      const { data: ratingData } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', params.product_id)
        .eq('status', 'approved')

      if (ratingData && ratingData.length > 0) {
        const sum = ratingData.reduce((acc, review) => acc + review.rating, 0)
        averageRating = parseFloat((sum / ratingData.length).toFixed(1))
        totalReviews = ratingData.length
      }
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      hasMore: count ? (offset + params.limit) < count : false,
      averageRating,
      totalReviews
    })

  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}