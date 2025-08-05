import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      // If category looks like a slug, get the category ID first
      if (category.includes('-')) {
        try {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category)
            .single()
          
          if (categoryError || !categoryData) {
            console.log(`Category '${category}' not found:`, categoryError)
            // Category not found, return empty results
            return NextResponse.json({ 
              products: [], 
              hasMore: false,
              total: 0 
            });
          }
          
          query = query.eq('category_id', categoryData.id)
        } catch (error) {
          console.error('Category lookup error:', error)
          return NextResponse.json({ error: 'Failed to lookup category' }, { status: 500 });
        }
      } else {
        // Assume it's a category ID
        query = query.eq('category_id', category);
      }
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create new product
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}