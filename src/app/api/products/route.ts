import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { searchParametersSchema, validateAndSanitize, validateEnvironmentVariables } from '@/lib/validation';

// Environment validation with fallback
try {
  validateEnvironmentVariables(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
} catch (error) {
  console.error('Environment validation failed:', error);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize query parameters
    const queryParams: any = {};
    
    // Only add parameters that have values
    const search = searchParams.get('search');
    if (search) queryParams.q = search;
    
    const category = searchParams.get('category');  
    if (category) queryParams.category = category;
    
    queryParams.sort = searchParams.get('sortBy') || 'created_at';
    queryParams.order = searchParams.get('sortOrder') || 'desc';
    queryParams.page = parseInt(searchParams.get('page') || '1');
    // Handle "all" parameter for show all products - use 1000 as "show all"
    const limitParam = searchParams.get('limit');
    if (limitParam === 'all') {
      queryParams.limit = 1000;
    } else {
      queryParams.limit = Math.min(parseInt(limitParam || '20'), 1000);
    }
    
    const minPrice = searchParams.get('min_price');
    if (minPrice) queryParams.min_price = parseFloat(minPrice);
    
    const maxPrice = searchParams.get('max_price');
    if (maxPrice) queryParams.max_price = parseFloat(maxPrice);
    
    const featured = searchParams.get('featured');
    if (featured === 'true') queryParams.featured = true;

    const validation = validateAndSanitize(searchParametersSchema, queryParams);
    if (!validation.success) {
      console.error('Products API validation failed:', {
        queryParams,
        validationError: validation.error,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({
        error: 'Invalid parameters',
        details: validation.error,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const params = validation.data;
    const offset = (params.page - 1) * params.limit;

    const supabase = createSupabaseAdmin();

    // Simplified query to avoid join issues
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + params.limit - 1);

    // Handle category filtering
    if (params.category) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(params.category)) {
        // Direct UUID lookup
        query = query.eq('category_id', params.category);
      } else {
        // For slug lookup, we need to first get the category ID
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', params.category)
          .eq('is_active', true)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
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
      
      return NextResponse.json({
        error: 'Failed to fetch products',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
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
    console.error('Products API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });

    // For debugging in production, return more detailed error info temporarily
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'Products API failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Simple fallback error response
    return NextResponse.json({
      error: 'Unable to fetch products',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create new product
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}