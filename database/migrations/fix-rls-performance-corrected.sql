-- FIX RLS PERFORMANCE WARNINGS - CORRECTED FOR ACTUAL SCHEMA
-- Based on actual policy analysis showing real column names

-- ========================================
-- 1. FIX AUTH FUNCTION WRAPPING (CONFIRMED COLUMNS)
-- ========================================

-- Fix newsletter_subscribers - already has one optimized, fix the old one
DROP POLICY IF EXISTS "Users can update own newsletter subscription" ON newsletter_subscribers;

-- Fix orders policy - uses customer_id (not customer_email)
DROP POLICY IF EXISTS "customers_own_orders" ON orders;
CREATE POLICY "customers_own_orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = (SELECT auth.uid()));

-- Fix order_items policy - uses customer_id in orders table
DROP POLICY IF EXISTS "customers_own_order_items" ON order_items;
CREATE POLICY "customers_own_order_items" ON order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_id = (SELECT auth.uid())
        )
    );

-- Fix customers policy - uses id column (not user_id)
DROP POLICY IF EXISTS "customers_own_data" ON customers;
CREATE POLICY "customers_own_data" ON customers
    FOR ALL TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Fix custom_quotes policy - uses customer_id
DROP POLICY IF EXISTS "customers_own_quotes" ON custom_quotes;
CREATE POLICY "customers_own_quotes" ON custom_quotes
    FOR ALL TO authenticated
    USING (customer_id = (SELECT auth.uid()))
    WITH CHECK (customer_id = (SELECT auth.uid()));

-- ========================================
-- 2. CONSOLIDATE DUPLICATE POLICIES (SAFE TABLES ONLY)
-- ========================================

-- Only consolidate policies for tables we know are safe
-- Categories - if they exist
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;

CREATE POLICY "categories_public_access" ON categories
    FOR SELECT TO public
    USING (is_active = true);

-- Products - if they exist
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

CREATE POLICY "products_public_access" ON products
    FOR SELECT TO public
    USING (is_active = true);

-- Product variants - if they exist
DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access to product_variants" ON product_variants;

CREATE POLICY "product_variants_public_access" ON product_variants
    FOR SELECT TO public
    USING (is_active = true);

-- Product images - if they exist
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
DROP POLICY IF EXISTS "Allow public read access to product_images" ON product_images;

CREATE POLICY "product_images_public_access" ON product_images
    FOR SELECT TO public
    USING (true);

-- ========================================
-- 3. VERIFICATION
-- ========================================

-- Check remaining policies with auth functions that need optimization
SELECT tablename, policyname, qual
FROM pg_policies 
WHERE schemaname = 'public'
AND qual LIKE '%auth.%' 
AND qual NOT LIKE '%(SELECT auth.%'
ORDER BY tablename;

-- Show all current policies after optimization
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ========================================
-- PERFORMANCE NOTES
-- ========================================

-- Key fixes based on your actual schema:
-- 1. orders table uses customer_id (UUID) not customer_email  
-- 2. customers table uses id column not user_id
-- 3. custom_quotes uses customer_id properly
-- 4. newsletter_subscribers already had one optimized policy
-- 5. All auth.uid() calls wrapped with (SELECT auth.uid()) for performance