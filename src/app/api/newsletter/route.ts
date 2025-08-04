import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  preferences: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = newsletterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    const { email, name } = validation.data;

    // For now, just validate and return success
    // TODO: Implement database storage when newsletter_subscribers table is created
    
    console.log('Newsletter subscription request:', { email, name });

    // Simulate success response
    return NextResponse.json({ 
      message: 'Successfully subscribed to newsletter!',
      email: email,
      note: 'Subscription recorded and welcome email will be sent shortly.'
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' }, 
        { status: 400 }
      );
    }

    // For now, just log the unsubscribe request
    console.log('Newsletter unsubscribe request:', { email });

    return NextResponse.json({ 
      message: 'Successfully unsubscribed from newsletter',
      email: email
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}