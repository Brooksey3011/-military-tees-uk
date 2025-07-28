import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, requirements, design_images } = body;

    const { data: quote, error } = await supabase
      .from('custom_quotes')
      .insert({
        customer_id,
        requirements,
        design_images,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }

    return NextResponse.json({ quote, message: 'Quote request submitted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}