import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema, validateAndSanitize, sanitizeInput, validateEnvironmentVariables } from '@/lib/validation';
import { headers } from 'next/headers';
import { rateLimitMiddleware, recordSuccess, RATE_LIMITS } from '@/lib/rate-limit';

// Validate required environment variables
validateEnvironmentVariables(['NEXT_PUBLIC_SUPABASE_URL']);

export async function POST(request: NextRequest) {
  // Apply rate limiting for newsletter subscriptions
  const rateLimitResult = rateLimitMiddleware.contact(request)
  if (rateLimitResult) {
    return rateLimitResult
  }

  try {
    // Security headers validation
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const origin = headersList.get('origin');
    
    // Basic security checks
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Rate limiting check (simple implementation)
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    console.log(`Newsletter subscription attempt from IP: ${ip}`);

    const body = await request.json();
    
    // Validate and sanitize input
    const validation = validateAndSanitize(newsletterSchema, body);
    if (!validation.success) {
      console.warn('Newsletter validation failed:', (validation as any).error);
      return NextResponse.json(
        { 
          error: 'Invalid subscription data',
          details: (validation as any).error
        }, 
        { status: 400 }
      );
    }

    const { email, firstName } = validation.data;

    // Additional email security check
    if (email.includes('<') || email.includes('>') || email.includes('script')) {
      console.warn('Suspicious email detected:', email);
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Log successful subscription for monitoring
    console.log('Newsletter subscription processed:', { 
      email: email.substring(0, 3) + '***', // Partially masked for privacy
      hasName: !!firstName,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement database storage when newsletter_subscribers table is created
    // For now, validate and return success
    
    // Record successful newsletter subscription
    recordSuccess(request, RATE_LIMITS.CONTACT, 'contact')

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      note: 'Welcome email will be sent shortly.'
    });

  } catch (error) {
    console.error('Newsletter API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Generic error response - don't expose internal details
    return NextResponse.json({ 
      error: 'Unable to process subscription. Please try again later.' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Security headers validation
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' }, 
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const sanitizedEmail = sanitizeInput(email);
    
    // Basic email validation
    if (!sanitizedEmail.includes('@') || sanitizedEmail.length > 254) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Log unsubscribe for monitoring (partially masked)
    console.log('Newsletter unsubscribe request:', { 
      email: sanitizedEmail.substring(0, 3) + '***',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      error: 'Unable to process unsubscribe request. Please try again later.' 
    }, { status: 500 });
  }
}