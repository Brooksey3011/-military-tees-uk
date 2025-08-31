-- OPTIONAL SECURITY HARDENING: Fix Supabase Linter Warnings
-- These are WARN level (not critical) but good for maximum security

-- ========================================
-- 1. FIX FUNCTION SEARCH PATH VULNERABILITIES
-- ========================================

-- Fix generate_order_number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix set_order_number function  
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix get_customer_by_user_id function (if it exists)
-- Note: Check if this function exists before running
-- CREATE OR REPLACE FUNCTION get_customer_by_user_id(user_uuid uuid)
-- RETURNS TABLE(
--     id uuid,
--     first_name text,
--     last_name text,
--     email text,
--     phone text
-- ) AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT 
--         c.id,
--         c.first_name,
--         c.last_name,
--         u.email,
--         c.phone
--     FROM customers c
--     JOIN auth.users u ON c.user_id = u.id
--     WHERE c.user_id = user_uuid;
-- END;
-- $$ LANGUAGE plpgsql
-- SET search_path = public;

-- Fix update_inventory_on_order function (if it exists)
-- Note: Check if this function exists before running
-- CREATE OR REPLACE FUNCTION update_inventory_on_order()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     -- Implementation depends on your specific inventory logic
--     -- This is a placeholder - adjust based on your actual function
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql
-- SET search_path = public;

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Run this to verify functions now have fixed search_path
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as source,
    proconfig as config
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname IN (
    'generate_order_number',
    'set_order_number', 
    'update_updated_at_column',
    'get_customer_by_user_id',
    'update_inventory_on_order'
)
ORDER BY proname;

-- ========================================
-- NOTES
-- ========================================

-- After running this script:
-- 1. Function search path warnings should be resolved
-- 2. Auth warnings need to be fixed in Supabase Auth settings (not SQL)
-- 3. These are security hardening measures, not critical fixes
-- 4. The main RLS security issues were already resolved in previous script

-- For Auth settings (manual steps in Supabase dashboard):
-- 1. Go to Authentication → Settings → Password & Security
-- 2. Enable "Password Strength" with HaveIBeenPwned protection
-- 3. Go to Authentication → Settings → Multi-factor Authentication  
-- 4. Enable additional MFA methods (TOTP, SMS, etc.)