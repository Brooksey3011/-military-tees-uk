-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(100) NOT NULL,
  review_content TEXT NOT NULL CHECK (char_length(review_content) >= 10),
  images TEXT[], -- Array of image URLs
  video_url TEXT,
  helpful_votes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_product_reviews_helpful_votes ON product_reviews(helpful_votes);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_status_created 
ON product_reviews(product_id, status, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading approved reviews (public can read)
CREATE POLICY IF NOT EXISTS "Anyone can read approved reviews" 
ON product_reviews FOR SELECT 
USING (status = 'approved');

-- Policy for creating reviews (anyone can create, but they go to pending status)
CREATE POLICY IF NOT EXISTS "Anyone can create reviews" 
ON product_reviews FOR INSERT 
WITH CHECK (status = 'pending');

-- Policy for admins to manage all reviews (update/delete)
CREATE POLICY IF NOT EXISTS "Admins can manage reviews" 
ON product_reviews FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@militarytees.co.uk'
  )
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for review statistics
CREATE OR REPLACE VIEW product_review_stats AS
SELECT 
  product_id,
  COUNT(*) as total_reviews,
  AVG(rating)::NUMERIC(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
  SUM(helpful_votes) as total_helpful_votes
FROM product_reviews 
WHERE status = 'approved'
GROUP BY product_id;