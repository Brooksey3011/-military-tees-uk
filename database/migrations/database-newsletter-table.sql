-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  preferences TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(active);

-- Enable RLS (Row Level Security)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy to allow public to subscribe
CREATE POLICY "Allow public newsletter subscription" ON newsletter_subscribers
  FOR INSERT TO public
  WITH CHECK (true);

-- Policy to allow public to read own subscription (for unsubscribe)
CREATE POLICY "Allow public to read own subscription" ON newsletter_subscribers
  FOR SELECT TO public
  USING (true); -- We'll validate by email in the API

-- Policy to allow public to update own subscription (for unsubscribe)
CREATE POLICY "Allow public to update own subscription" ON newsletter_subscribers
  FOR UPDATE TO public
  USING (true); -- We'll validate by email in the API