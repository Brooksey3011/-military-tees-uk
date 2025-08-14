import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    console.log('🔍 Products API called with:', { category, search, featured, limit, offset });
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
      serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...'
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (category) {
      // Check if category is a UUID (format: 8-4-4-4-12 characters)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(category)) {
        // It's a UUID, use directly as category_id
        console.log(`Using category UUID: ${category}`);
        query = query.eq('category_id', category);
      } else {
        // It's a slug, look up the category ID
        try {
          console.log(`Looking up category with slug: ${category}`);
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category)
            .single()
          
          if (categoryError || !categoryData) {
            console.log(`Category '${category}' not found:`, categoryError);
            // Return empty results for non-existent category
            return NextResponse.json({ 
              products: [], 
              hasMore: false,
              total: 0 
            });
          }
          
          console.log(`Found category ID: ${categoryData.id}`);
          query = query.eq('category_id', categoryData.id);
        } catch (error) {
          console.error('Category lookup error:', error);
          return NextResponse.json({ error: 'Failed to lookup category' }, { status: 500 });
        }
      }
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Add sorting with error handling
    try {
      console.log(`🔄 Applying sorting: ${sortBy} ${sortOrder}`);
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } catch (sortError) {
      console.error('❌ Sorting error:', sortError);
      // Fallback to default sorting
      query = query.order('created_at', { ascending: false });
    }

    console.log('🚀 Executing database query...');
    const { data: products, error, count } = await query;

    if (error) {
      console.error('❌ Database error details:', error);
      console.error('❌ Database error message:', error.message);
      console.error('❌ Database error code:', error.code);
      return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
    }

    // Calculate if there are more products
    const hasMore = count ? (offset + limit) < count : false;
    const total = count || 0;

    return NextResponse.json({ 
      products: products || [], 
      hasMore,
      total 
    });
  } catch (error) {
    console.error('💥 Server error details:', error);
    console.error('💥 Server error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Server error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create new product
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}