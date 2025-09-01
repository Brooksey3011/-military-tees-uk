-- Configure Supabase Auth to use custom password reset emails via webhook
-- This replaces the default Supabase password reset email with our custom styled version

-- First, enable the auth hooks (run in Supabase Dashboard -> Database -> Functions)

-- 1. Create the webhook function for password reset
CREATE OR REPLACE FUNCTION send_custom_password_reset_email()
RETURNS trigger AS $$
DECLARE
  webhook_url TEXT := 'https://your-domain.vercel.app/api/auth/password-reset';
  reset_url TEXT;
  request_id bigint;
BEGIN
  -- This function triggers when auth.users table is updated with a recovery token
  IF TG_OP = 'UPDATE' AND NEW.recovery_token IS NOT NULL AND OLD.recovery_token IS DISTINCT FROM NEW.recovery_token THEN
    
    -- Build the password reset URL (same format as Supabase default)
    reset_url := 'https://your-domain.vercel.app/auth/reset-password?token=' || NEW.recovery_token || '&type=recovery';
    
    -- Log the password reset trigger
    RAISE LOG 'Triggering custom password reset email for user: %', NEW.email;
    
    -- Make HTTP request to our password reset email API
    SELECT INTO request_id net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'reset_url', reset_url,
        'token', NEW.recovery_token,
        'created_at', NOW()
      )::text
    );
    
    RAISE LOG 'Custom password reset email webhook triggered with request_id: %', request_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table for password resets
DROP TRIGGER IF EXISTS trigger_send_custom_password_reset_email ON auth.users;
CREATE TRIGGER trigger_send_custom_password_reset_email
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_custom_password_reset_email();

-- 2. Disable Supabase's default password reset emails (run in Supabase Dashboard -> Settings -> Auth)
-- Set the following in your Supabase Auth settings:
-- - "Enable email confirmations" = true (keep enabled)
-- - Custom SMTP settings (if using Resend SMTP)
-- - Or use Supabase's built-in email but override with webhooks

-- IMPORTANT SETUP STEPS:
-- 1. Update webhook_url with your actual domain in both functions above
-- 2. Run this SQL in your Supabase SQL Editor  
-- 3. Ensure pg_net extension is enabled: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 4. Test by requesting a password reset from your app
-- 5. Check logs in Supabase Dashboard -> Logs -> Functions for webhook calls

-- Alternative approach (if webhooks don't work):
-- You can also override Supabase's email templates directly in:
-- Supabase Dashboard -> Auth -> Email Templates
-- Then use the password reset template content from password-reset.ts