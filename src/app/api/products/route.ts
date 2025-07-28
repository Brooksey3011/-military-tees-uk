import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create new product
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}