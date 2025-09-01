-- FIX SUPABASE RLS PERFORMANCE WARNINGS
-- These are WARN level issues that can be optimized for better performance

-- ========================================
-- 1. FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- ========================================

-- Fix newsletter_subscribers policy - optimize auth function calls
DROP POLICY IF EXISTS "Users can update own newsletter subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to update own subscription" ON newsletter_subscribers;
CREATE POLICY "Allow public to update own subscription" ON newsletter_subscribers
    FOR UPDATE TO public
    USING (email = (SELECT auth.email()))
    WITH CHECK (email = (SELECT auth.email()));

-- Fix orders policy - optimize auth function calls (uses customer_email)
DROP POLICY IF EXISTS "customers_own_orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_email = (SELECT auth.email()));

-- Fix order_items policy - optimize auth function calls  
DROP POLICY IF EXISTS "customers_own_order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_email = (SELECT auth.email())
        )
    );

-- Note: Customers and custom_quotes tables may not exist or have different structure
-- Skipping these policies to avoid errors

-- ========================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES ISSUES
-- ========================================

-- Categories table - consolidate duplicate policies
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;

-- Create single optimized policy for categories
CREATE POLICY "categories_public_access" ON categories
    FOR SELECT TO public
    USING (is_active = true);

-- Newsletter subscribers - consolidate policies
DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON newsletter_subscribers;

-- Create single policy for newsletter subscription
CREATE POLICY "newsletter_public_operations" ON newsletter_subscribers
    FOR INSERT TO public
    WITH CHECK (true);

-- Product images - consolidate duplicate policies
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
DROP POLICY IF EXISTS "Allow public read access to product_images" ON product_images;

-- Create single policy for product images
CREATE POLICY "product_images_public_access" ON product_images
    FOR SELECT TO public
    USING (true);

-- Product variants - consolidate duplicate policies  
DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access to product_variants" ON product_variants;

-- Create single policy for product variants
CREATE POLICY "product_variants_public_access" ON product_variants
    FOR SELECT TO public
    USING (is_active = true AND stock_quantity >= 0);

-- Products - consolidate duplicate policies
DROP POLICY IF EXISTS "products_public_read" ON products;  
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

-- Create single policy for products
CREATE POLICY "products_public_access" ON products
    FOR SELECT TO public
    USING (is_active = true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check policies after optimization
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check for remaining auth function calls that could be optimized
SELECT schemaname, tablename, policyname, qual
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%auth.%' AND qual NOT LIKE '%(SELECT auth.%');

-- ========================================
-- PERFORMANCE NOTES
-- ========================================

-- These changes will:
-- 1. Wrap auth function calls with SELECT to prevent per-row evaluation
-- 2. Consolidate multiple permissive policies into single policies
-- 3. Improve query performance at scale
-- 4. Maintain the same security functionality

-- All policies maintain the same access patterns while being more efficient
-- The (SELECT auth.function()) pattern evaluates once per query instead of per row