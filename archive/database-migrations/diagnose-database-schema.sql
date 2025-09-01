-- DIAGNOSE ACTUAL DATABASE SCHEMA
-- Run this first to see what tables and columns actually exist

-- ========================================
-- 1. CHECK WHAT TABLES EXIST
-- ========================================

SELECT tablename, schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ========================================
-- 2. CHECK NEWSLETTER_SUBSCRIBERS TABLE
-- ========================================

-- Check if newsletter_subscribers table exists and its columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;

-- Check existing policies on newsletter_subscribers
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'newsletter_subscribers';

-- ========================================
-- 3. CHECK ORDERS TABLE
-- ========================================

-- Check if orders table exists and its columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Check existing policies on orders
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'orders';

-- ========================================
-- 4. CHECK ORDER_ITEMS TABLE
-- ========================================

-- Check if order_items table exists and its columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'order_items'
ORDER BY ordinal_position;

-- Check existing policies on order_items
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'order_items';

-- ========================================
-- 5. CHECK FOR OTHER TABLES MENTIONED IN WARNINGS
-- ========================================

-- Check customers table (if it exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Check custom_quotes table (if it exists)  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'custom_quotes'
ORDER BY ordinal_position;

-- ========================================
-- 6. CHECK CATEGORIES AND PRODUCTS TABLES
-- ========================================

-- Categories table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

-- Products table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- ========================================
-- 7. CHECK ALL EXISTING RLS POLICIES
-- ========================================

-- Show all current RLS policies that might be causing conflicts
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ========================================
-- 8. CHECK RLS STATUS ON TABLES
-- ========================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;