import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      requirements, 
      designType, 
      quantity, 
      budget,
      design_images 
    } = body;

    // Use admin client to bypass RLS for custom quotes
    const supabase = createSupabaseAdmin();

    // Create quote record using the actual table structure
    const quoteData = {
      name: name,
      email: email,
      description: `${requirements || 'Custom design request'}\n\nDesign Type: ${designType}\nQuantity: ${quantity}\nBudget: ${budget}\nPhone: ${phone}`,
      order_type: 'custom_design',
      status: 'pending'
    };

    const { data: quote, error } = await supabase
      .from('custom_quotes')
      .insert(quoteData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to create quote',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      quote, 
      message: 'Quote request submitted successfully! We\'ll get back to you within 24 hours.' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}