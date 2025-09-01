-- FIX SUPABASE RLS PERFORMANCE WARNINGS
-- These are WARN level issues that can be optimized for better performance

-- ========================================
-- 1. FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- ========================================

-- Fix newsletter_subscribers policy - optimize auth function calls
DROP POLICY IF EXISTS "Users can update own newsletter subscription" ON newsletter_subscribers;
CREATE POLICY "Users can update own newsletter subscription" ON newsletter_subscribers
    FOR UPDATE TO authenticated
    USING (email = (SELECT auth.jwt() ->> 'email'))
    WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

-- Fix customers policy - optimize auth function calls  
DROP POLICY IF EXISTS "customers_own_data" ON customers;
CREATE POLICY "customers_own_data" ON customers
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix orders policy - optimize auth function calls
DROP POLICY IF EXISTS "customers_own_orders" ON orders;
CREATE POLICY "customers_own_orders" ON orders
    FOR ALL TO authenticated
    USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = (SELECT auth.uid())
    ));

-- Fix order_items policy - optimize auth function calls
DROP POLICY IF EXISTS "customers_own_order_items" ON order_items;
CREATE POLICY "customers_own_order_items" ON order_items
    FOR ALL TO authenticated
    USING (order_id IN (
        SELECT o.id FROM orders o 
        JOIN customers c ON o.customer_id = c.id 
        WHERE c.user_id = (SELECT auth.uid())
    ));

-- Fix custom_quotes policy - optimize auth function calls
DROP POLICY IF EXISTS "customers_own_quotes" ON custom_quotes;
CREATE POLICY "customers_own_quotes" ON custom_quotes
    FOR ALL TO authenticated
    USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = (SELECT auth.uid())
    ));

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