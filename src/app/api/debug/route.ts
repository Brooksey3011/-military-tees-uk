import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🐛 Debug endpoint called');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      supabaseUrlPrefix: supabaseUrl?.substring(0, 20) + '...',
      hasServiceKey: !!supabaseKey,
      serviceKeyPrefix: supabaseKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔄 Testing database connection...');
    
    // Test 1: Basic connection
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(3);
    
    console.log('📊 Categories test:', { count: categories?.length, error: catError?.message });

    // Test 2: Products test
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, slug, category_id')
      .limit(3);
      
    console.log('📦 Products test:', { count: products?.length, error: prodError?.message });

    // Test 3: Category lookup (armoury specifically)
    const { data: armouryCategory, error: armouryError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'armoury')
      .single();
      
    console.log('🎯 Armoury category test:', { found: !!armouryCategory, error: armouryError?.message });

    // Test 4: Products in armoury category
    if (armouryCategory) {
      const { data: armouryProducts, error: armouryProdError } = await supabase
        .from('products')
        .select('id, name, category_id')
        .eq('category_id', armouryCategory.id)
        .limit(2);
        
      console.log('🏺 Armoury products test:', { count: armouryProducts?.length, error: armouryProdError?.message });
    }

    return NextResponse.json({
      status: 'Debug complete',
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV
      },
      tests: {
        categories: { count: categories?.length, error: catError?.message },
        products: { count: products?.length, error: prodError?.message },
        armouryCategory: { found: !!armouryCategory, error: armouryError?.message },
        armouryProducts: armouryCategory ? { 
          count: (await supabase.from('products').select('id').eq('category_id', armouryCategory.id).limit(2)).data?.length 
        } : 'skipped'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🚨 Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}