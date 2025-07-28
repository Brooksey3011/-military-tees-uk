-- Customer Reviews Database Schema for Military Tees UK
-- This file contains all tables and views needed for the customer reviews system

-- ==============================================
-- Core Reviews Tables
-- ==============================================

-- Main reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10),
  photo_urls TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_is_verified ON reviews(is_verified_purchase);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful_count ON reviews(helpful_count DESC);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one vote per user per review
  UNIQUE(review_id, user_id)
);

-- Indexes for review helpfulness
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user_id ON review_helpfulness(user_id);

-- Review moderation log
CREATE TABLE IF NOT EXISTS review_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged')),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for moderation log
CREATE INDEX IF NOT EXISTS idx_review_moderation_review_id ON review_moderation_log(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_admin_id ON review_moderation_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_created_at ON review_moderation_log(created_at DESC);

-- Review flags table (for user-reported reviews)
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_type VARCHAR(50) NOT NULL CHECK (flag_type IN ('inappropriate', 'spam', 'fake', 'off_topic', 'other')),
  reason TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for review flags
CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_resolved ON review_flags(is_resolved);
CREATE INDEX IF NOT EXISTS idx_review_flags_created_at ON review_flags(created_at DESC);

-- ==============================================
-- Add Review Fields to Products Table
-- ==============================================

-- Add review summary fields to products table if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create indexes for review fields
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_review_count ON products(review_count DESC);

-- ==============================================
-- Views for Reviews Analytics
-- ==============================================

-- Product review summary view
CREATE OR REPLACE VIEW product_review_summary AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.slug as product_slug,
  COUNT(r.id) as total_reviews,
  COUNT(CASE WHEN r.is_approved = true THEN 1 END) as approved_reviews,
  COUNT(CASE WHEN r.is_verified_purchase = true THEN 1 END) as verified_reviews,
  COUNT(CASE WHEN array_length(r.photo_urls, 1) > 0 THEN 1 END) as photo_reviews,
  AVG(CASE WHEN r.is_approved = true THEN r.rating END) as average_rating,
  
  -- Rating distribution for approved reviews
  COUNT(CASE WHEN r.is_approved = true AND r.rating = 5 THEN 1 END) as rating_5_count,
  COUNT(CASE WHEN r.is_approved = true AND r.rating = 4 THEN 1 END) as rating_4_count,
  COUNT(CASE WHEN r.is_approved = true AND r.rating = 3 THEN 1 END) as rating_3_count,
  COUNT(CASE WHEN r.is_approved = true AND r.rating = 2 THEN 1 END) as rating_2_count,
  COUNT(CASE WHEN r.is_approved = true AND r.rating = 1 THEN 1 END) as rating_1_count,
  
  -- Recent activity
  COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as reviews_last_30d,
  MAX(r.created_at) as latest_review_date

FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.slug;

-- Review moderation dashboard view
CREATE OR REPLACE VIEW review_moderation_dashboard AS
SELECT 
  r.id,
  r.product_id,
  p.name as product_name,
  p.slug as product_slug,
  r.customer_name,
  r.customer_email,
  r.rating,
  r.title,
  r.comment,
  r.photo_urls,
  r.is_verified_purchase,
  r.is_approved,
  r.created_at,
  r.updated_at,
  
  -- Flag information
  COUNT(rf.id) as flag_count,
  MAX(rf.created_at) as latest_flag_date,
  STRING_AGG(rf.flag_type, ', ') as flag_types,
  
  -- Moderation history
  COUNT(rml.id) as moderation_actions_count,
  MAX(rml.created_at) as last_moderation_date

FROM reviews r
JOIN products p ON r.product_id = p.id
LEFT JOIN review_flags rf ON r.id = rf.review_id AND rf.is_resolved = false
LEFT JOIN review_moderation_log rml ON r.id = rml.review_id
GROUP BY r.id, r.product_id, p.name, p.slug, r.customer_name, r.customer_email, 
         r.rating, r.title, r.comment, r.photo_urls, r.is_verified_purchase, 
         r.is_approved, r.created_at, r.updated_at;

-- Customer review history view
CREATE OR REPLACE VIEW customer_review_history AS
SELECT 
  c.id as customer_id,
  c.user_id,
  u.email as customer_email,
  u.raw_user_meta_data->>'full_name' as customer_name,
  COUNT(r.id) as total_reviews,
  AVG(r.rating) as average_rating_given,
  COUNT(CASE WHEN r.is_verified_purchase = true THEN 1 END) as verified_reviews,
  COUNT(CASE WHEN array_length(r.photo_urls, 1) > 0 THEN 1 END) as photo_reviews,
  MIN(r.created_at) as first_review_date,
  MAX(r.created_at) as latest_review_date

FROM customers c
JOIN auth.users u ON c.user_id = u.id
LEFT JOIN reviews r ON c.id = r.customer_id AND r.is_approved = true
GROUP BY c.id, c.user_id, u.email, u.raw_user_meta_data->>'full_name';

-- ==============================================
-- Functions for Review Management
-- ==============================================

-- Function to update review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpfulness(
  review_id UUID,
  helpful_increment INTEGER DEFAULT 0,
  not_helpful_increment INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE reviews
  SET 
    helpful_count = GREATEST(0, helpful_count + helpful_increment),
    not_helpful_count = GREATEST(0, not_helpful_count + not_helpful_increment),
    updated_at = NOW()
  WHERE id = review_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating cache
CREATE OR REPLACE FUNCTION update_product_rating_cache(product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- Calculate average rating and count for approved reviews
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE product_id = update_product_rating_cache.product_id 
    AND is_approved = true;
  
  -- Update product table
  UPDATE products
  SET 
    average_rating = avg_rating,
    review_count = review_count,
    updated_at = NOW()
  WHERE id = product_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically approve reviews from verified customers
CREATE OR REPLACE FUNCTION auto_approve_trusted_reviews()
RETURNS INTEGER AS $$
DECLARE
  approved_count INTEGER := 0;
  review_record RECORD;
BEGIN
  -- Find reviews from customers with multiple verified purchases and good history
  FOR review_record IN
    SELECT r.id
    FROM reviews r
    JOIN customers c ON r.customer_id = c.id
    WHERE r.is_approved = false
      AND r.is_verified_purchase = true
      AND r.rating >= 3  -- Don't auto-approve low ratings
      AND LENGTH(r.comment) >= 20  -- Substantial reviews only
      AND NOT EXISTS (
        -- No flagged reviews from this customer
        SELECT 1 FROM review_flags rf
        JOIN reviews r2 ON rf.review_id = r2.id
        WHERE r2.customer_id = c.id AND rf.is_resolved = false
      )
      AND (
        -- Customer has multiple verified purchases or good review history
        SELECT COUNT(*) FROM reviews r3 
        WHERE r3.customer_id = c.id AND r3.is_verified_purchase = true
      ) >= 2
  LOOP
    -- Approve the review
    UPDATE reviews
    SET 
      is_approved = true,
      updated_at = NOW()
    WHERE id = review_record.id;
    
    approved_count := approved_count + 1;
    
    -- Log the auto-approval
    INSERT INTO review_moderation_log (
      review_id,
      action,
      notes
    ) VALUES (
      review_record.id,
      'approved',
      'Auto-approved for trusted customer'
    );
  END LOOP;
  
  RETURN approved_count;
END;
$$ LANGUAGE plpgsql;

-- Function to detect potentially fake reviews
CREATE OR REPLACE FUNCTION detect_suspicious_reviews()
RETURNS TABLE (
  review_id UUID,
  product_id UUID,
  customer_id UUID,
  suspicion_reasons TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as review_id,
    r.product_id,
    r.customer_id,
    ARRAY_AGG(DISTINCT reason.suspicion_reason) as suspicion_reasons
  FROM reviews r
  CROSS JOIN LATERAL (
    SELECT 
      CASE
        -- Multiple reviews from same IP/device (would need additional tracking)
        WHEN EXISTS (
          SELECT 1 FROM reviews r2 
          WHERE r2.customer_email = r.customer_email 
            AND r2.id != r.id 
            AND r2.created_at >= r.created_at - INTERVAL '1 hour'
        ) THEN 'Multiple reviews from same email in short timeframe'
        
        -- Suspicious rating patterns
        WHEN r.rating = 5 AND LENGTH(r.comment) < 20 THEN 'Very short positive review'
        
        -- Review content analysis (basic keyword detection)
        WHEN r.comment ILIKE '%best product ever%' 
          OR r.comment ILIKE '%amazing quality%' 
          OR r.comment ILIKE '%highly recommend%' 
          AND LENGTH(r.comment) < 50 THEN 'Generic positive language in short review'
        
        -- Customer with only positive reviews
        WHEN NOT EXISTS (
          SELECT 1 FROM reviews r3 
          WHERE r3.customer_id = r.customer_id 
            AND r3.rating < 5 
            AND r3.id != r.id
        ) AND (
          SELECT COUNT(*) FROM reviews r4 
          WHERE r4.customer_id = r.customer_id
        ) > 3 THEN 'Customer only leaves 5-star reviews'
        
        ELSE NULL
      END as suspicion_reason
  ) reason
  WHERE r.is_approved = false
    AND reason.suspicion_reason IS NOT NULL
  GROUP BY r.id, r.product_id, r.customer_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- Triggers for Review Management
-- ==============================================

-- Trigger to update product rating cache when review is approved/modified
CREATE OR REPLACE FUNCTION trigger_update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update on approval status change or rating change
  IF (TG_OP = 'UPDATE' AND (
    OLD.is_approved != NEW.is_approved OR 
    OLD.rating != NEW.rating
  )) OR TG_OP = 'INSERT' THEN
    PERFORM update_product_rating_cache(NEW.product_id);
  END IF;
  
  -- Update on deletion
  IF TG_OP = 'DELETE' THEN
    PERFORM update_product_rating_cache(OLD.product_id);
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'review_rating_cache_trigger'
  ) THEN
    CREATE TRIGGER review_rating_cache_trigger
      AFTER INSERT OR UPDATE OR DELETE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION trigger_update_product_rating();
  END IF;
END $$;

-- Trigger to log review modifications
CREATE OR REPLACE FUNCTION trigger_log_review_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when review approval status changes
  IF TG_OP = 'UPDATE' AND OLD.is_approved != NEW.is_approved THEN
    INSERT INTO review_moderation_log (review_id, action)
    VALUES (NEW.id, CASE WHEN NEW.is_approved THEN 'approved' ELSE 'rejected' END);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'review_changes_log_trigger'
  ) THEN
    CREATE TRIGGER review_changes_log_trigger
      AFTER UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION trigger_log_review_changes();
  END IF;
END $$;

-- ==============================================
-- Row Level Security (RLS) Policies
-- ==============================================

-- Enable RLS on review tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;

-- Policies for service role (full access)
CREATE POLICY "Service role can manage reviews" ON reviews
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage review helpfulness" ON review_helpfulness
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage moderation log" ON review_moderation_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage review flags" ON review_flags
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for public (read approved reviews)
CREATE POLICY "Anyone can read approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

-- Policies for authenticated users
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM customers 
      WHERE user_id = auth.uid() AND id = customer_id
    )
  );

CREATE POLICY "Users can read their own reviews" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE user_id = auth.uid() AND id = customer_id
    )
  );

CREATE POLICY "Users can mark reviews helpful" ON review_helpfulness
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their helpfulness votes" ON review_helpfulness
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for admin users
CREATE POLICY "Admin users can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can view moderation log" ON review_moderation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ==============================================
-- Sample Data and Initial Setup
-- ==============================================

-- Create storage bucket for review images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for review images
CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- Scheduled Jobs (requires pg_cron extension)
-- ==============================================

-- Auto-approve trusted customer reviews daily
-- SELECT cron.schedule('auto-approve-reviews', '0 2 * * *', 'SELECT auto_approve_trusted_reviews();');

-- Clean up old moderation logs (keep 1 year)
-- SELECT cron.schedule('cleanup-moderation-logs', '0 3 1 * *', 
--   'DELETE FROM review_moderation_log WHERE created_at < NOW() - INTERVAL ''1 year'';');

-- ==============================================
-- Performance Optimizations
-- ==============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved_rating ON reviews(product_id, is_approved, rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_approved_created ON reviews(customer_id, is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved_created_helpful ON reviews(is_approved, created_at DESC, helpful_count DESC);

-- Partial indexes for specific use cases
CREATE INDEX IF NOT EXISTS idx_reviews_pending_approval ON reviews(created_at DESC) 
  WHERE is_approved = false;

CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchases ON reviews(product_id, created_at DESC) 
  WHERE is_verified_purchase = true AND is_approved = true;

-- ==============================================
-- Data Validation Constraints
-- ==============================================

-- Ensure review ratings are valid
ALTER TABLE reviews ADD CONSTRAINT check_rating_range 
  CHECK (rating >= 1 AND rating <= 5);

-- Ensure review comment has minimum length
ALTER TABLE reviews ADD CONSTRAINT check_comment_length 
  CHECK (LENGTH(TRIM(comment)) >= 10);

-- Ensure helpfulness counts are non-negative
ALTER TABLE reviews ADD CONSTRAINT check_helpful_counts 
  CHECK (helpful_count >= 0 AND not_helpful_count >= 0);