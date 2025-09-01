import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { customQuoteRequestSchema, validateAndSanitize, validateEnvironmentVariables } from '@/lib/validation';
import { headers } from 'next/headers';

// Validate required environment variables
validateEnvironmentVariables(['SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']);

export async function POST(request: NextRequest) {
  try {
    // Security headers validation
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const origin = headersList.get('origin');
    
    // Basic security checks
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Map legacy field names to new schema
    const normalizedBody = {
      customer_email: body.email,
      customer_name: body.name,
      requirements: body.requirements || body.description,
      quantity: parseInt(body.quantity) || 1,
      budget: body.budget ? parseFloat(body.budget) : undefined,
      deadline: body.deadline,
      contact_phone: body.phone
    };

    const validation = validateAndSanitize(customQuoteRequestSchema, normalizedBody);
    
    if (!validation.success) {
      console.warn('Custom quote validation failed:', validation.error);
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: validation.error 
      }, { status: 400 });
    }

    const validData = validation.data;

    // Use admin client to bypass RLS for custom quotes
    const supabase = createSupabaseAdmin();

    // Create quote record with validated and sanitized data
    const quoteData = {
      name: validData.customer_name,
      email: validData.customer_email,
      description: `${validData.requirements}\n\n` + 
                   `Design Type: ${body.designType || 'Custom'}\n` +
                   `Quantity: ${validData.quantity}\n` +
                   (validData.budget ? `Budget: £${validData.budget}\n` : '') +
                   (validData.contact_phone ? `Phone: ${validData.contact_phone}\n` : '') +
                   (validData.deadline ? `Deadline: ${validData.deadline}` : ''),
      order_type: 'custom_design',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: quote, error } = await supabase
      .from('custom_quotes')
      .insert(quoteData)
      .select('id, name, email, status, created_at')
      .single();

    if (error) {
      console.error('Database error creating custom quote:', {
        error: error.message,
        code: error.code,
        email: validData.customer_email
      });
      
      // Don't expose internal database details
      return NextResponse.json({ 
        error: 'Failed to submit quote request. Please try again or contact support.'
      }, { status: 500 });
    }

    // Log successful quote submission for monitoring
    console.log('Custom quote submitted successfully:', {
      quoteId: quote.id,
      email: validData.customer_email,
      quantity: validData.quantity
    });

    return NextResponse.json({ 
      success: true,
      quote: {
        id: quote.id,
        status: quote.status,
        created_at: quote.created_at
      },
      message: 'Quote request submitted successfully! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Custom quote API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Generic error response - don't expose internal details
    return NextResponse.json({ 
      error: 'Unable to process request. Please try again later.' 
    }, { status: 500 });
  }
}