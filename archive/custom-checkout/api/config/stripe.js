// Vercel API Route: Stripe Configuration
// /api/config/stripe.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return the publishable key and other safe configuration
    const config = {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      country: 'GB',
      currency: 'gbp',
      supportedPaymentMethods: [
        'card',
        'apple_pay',
        'google_pay',
        'link'
      ],
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#4a5d23',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#dc3545',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '0px',
        }
      }
    };

    // Validate that required environment variables are set
    if (!config.publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return res.status(500).json({ 
        error: 'Stripe configuration incomplete',
        details: process.env.NODE_ENV === 'development' ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set' : undefined
      });
    }

    res.status(200).json(config);

  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({ 
      error: 'Failed to load configuration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}