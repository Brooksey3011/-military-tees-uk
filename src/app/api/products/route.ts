import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { searchParametersSchema, validateAndSanitize, validateEnvironmentVariables } from '@/lib/validation';
import { handleError, CommonErrors } from '@/lib/error-handling';

// Validate required environment variables
validateEnvironmentVariables(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize query parameters
    const queryParams = {
      q: searchParams.get('search'),
      category: searchParams.get('category'),
      sort: searchParams.get('sortBy') || 'created_at',
      order: searchParams.get('sortOrder') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50), // Cap at 50
      featured: searchParams.get('featured') === 'true'
    };

    const validation = validateAndSanitize(searchParametersSchema, queryParams);
    if (!validation.success) {
      throw CommonErrors.INVALID_INPUT(validation.error);
    }

    const params = validation.data;
    const offset = (params.page - 1) * params.limit;

    const supabase = createSupabaseAdmin();

    // Optimized query with proper joins to eliminate N+1 queries
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        main_image_url,
        is_featured,
        created_at,
        category:categories!inner(
          id,
          name,
          slug
        ),
        variants:product_variants!inner(
          id,
          sku,
          size,
          color,
          stock_quantity,
          price,
          is_active
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('variants.is_active', true)
      .range(offset, offset + params.limit - 1);

    // Handle category filtering with proper validation
    if (params.category) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(params.category)) {
        // Direct UUID lookup
        query = query.eq('category_id', params.category);
      } else {
        // Category slug lookup using inner join for better performance
        query = query.eq('category.slug', params.category);
      }
    }

    // Handle search with proper text search
    if (params.q) {
      query = query.or(`name.ilike.%${params.q}%, description.ilike.%${params.q}%`);
    }

    // Handle featured filter
    if (params.featured) {
      query = query.eq('is_featured', true);
    }

    // Apply sorting with validation
    const allowedSortFields = ['name', 'price', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(params.sort) ? params.sort : 'created_at';
    query = query.order(sortField, { ascending: params.order === 'asc' });

    // Execute optimized query
    const { data: products, error, count } = await query;

    if (error) {
      console.error('Database error in products query:', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
      throw CommonErrors.DATABASE_CONNECTION_FAILED();
    }

    // Calculate pagination info
    const hasMore = count ? (offset + params.limit) < count : false;
    const total = count || 0;

    return NextResponse.json({ 
      success: true,
      products: products || [], 
      hasMore,
      total,
      page: params.page,
      limit: params.limit,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return await handleError(error, {
      endpoint: '/api/products',
      method: 'GET'
    });
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create new product
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}