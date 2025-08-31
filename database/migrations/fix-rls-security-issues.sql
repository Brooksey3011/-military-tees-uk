-- CRITICAL SECURITY FIX: Enable RLS and Create Proper Policies
-- This fixes all the Supabase linter security errors

-- ========================================
-- 1. ENABLE RLS ON ALL PUBLIC TABLES
-- ========================================

-- Enable RLS on categories (currently disabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products (currently disabled) 
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_variants (currently disabled)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_images (currently disabled)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Enable RLS on newsletter_subscribers (already has policies, just enable RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. CREATE PUBLIC READ POLICIES FOR E-COMMERCE DATA
-- ========================================

-- Categories: Allow public read (needed for navigation)
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT TO public
  USING (is_active = true);

-- Products: Allow public read for active products  
CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT TO public  
  USING (is_active = true);

-- Product Variants: Allow public read for active variants
CREATE POLICY "Allow public read access to product_variants" ON product_variants
  FOR SELECT TO public
  USING (is_active = true);

-- Product Images: Allow public read (needed for product display)
CREATE POLICY "Allow public read access to product_images" ON product_images
  FOR SELECT TO public
  USING (true);

-- ========================================
-- 3. ADMIN/SERVICE ROLE POLICIES
-- ========================================

-- Allow service role to manage all data (for API operations)
CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role can manage products" ON products
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role can manage product_variants" ON product_variants
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role can manage product_images" ON product_images
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role can manage newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO service_role
  USING (true);

-- ========================================
-- 4. AUTHENTICATED USER POLICIES (if needed)
-- ========================================

-- Allow authenticated users to subscribe to newsletter
CREATE POLICY "Authenticated users can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their newsletter subscription
CREATE POLICY "Users can update own newsletter subscription" ON newsletter_subscribers
  FOR UPDATE TO authenticated
  USING (email = auth.email());

-- ========================================
-- 5. GRANT PROPER PERMISSIONS
-- ========================================

-- Grant read permissions to anonymous (public) users
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;  
GRANT SELECT ON product_variants TO anon;
GRANT SELECT ON product_images TO anon;

-- Grant full permissions to service role
GRANT ALL ON categories TO service_role;
GRANT ALL ON products TO service_role;
GRANT ALL ON product_variants TO service_role;
GRANT ALL ON product_images TO service_role;
GRANT ALL ON newsletter_subscribers TO service_role;

-- Grant specific permissions to authenticated users
GRANT SELECT ON categories TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON product_variants TO authenticated;
GRANT SELECT ON product_images TO authenticated;
GRANT INSERT, UPDATE ON newsletter_subscribers TO authenticated;

-- ========================================
-- SECURITY NOTES
-- ========================================

-- These policies ensure:
-- 1. Public users can read active products/categories (needed for e-commerce)
-- 2. Service role can manage all data (needed for API operations)  
-- 3. Authenticated users have appropriate access levels
-- 4. No sensitive data is exposed without proper authentication
-- 5. All Supabase linter security errors are resolved

-- Run this script in your Supabase SQL editor to fix all security issues