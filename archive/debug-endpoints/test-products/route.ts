import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testCategory = searchParams.get('category') || 'armoury';
    
    console.log('🧪 Testing products API with category:', testCategory);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test the exact same logic as the main products API
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .limit(2);

    if (testCategory) {
      console.log('🔍 Category parameter:', testCategory);
      console.log('🔍 Is UUID?', uuidRegex.test(testCategory));
      
      if (uuidRegex.test(testCategory)) {
        console.log('✅ Using as UUID');
        query = query.eq('category_id', testCategory);
      } else {
        console.log('🔍 Looking up slug:', testCategory);
        
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('slug', testCategory)
          .single();
        
        console.log('🔍 Category lookup result:', { categoryData, categoryError });
        
        if (categoryError || !categoryData) {
          console.log('❌ Category not found');
          return NextResponse.json({ 
            error: 'Category not found',
            searchedSlug: testCategory,
            categoryError: categoryError?.message
          }, { status: 404 });
        }
        
        console.log('✅ Found category ID:', categoryData.id);
        query = query.eq('category_id', categoryData.id);
      }
    }

    console.log('🔄 Executing products query...');
    const { data: products, error, count } = await query;
    
    console.log('📊 Query result:', { 
      productCount: products?.length, 
      error: error?.message,
      totalCount: count 
    });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      category: testCategory,
      productCount: products?.length || 0,
      products: products?.slice(0, 1), // Just return first product for debugging
      totalCount: count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🚨 Test endpoint error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}