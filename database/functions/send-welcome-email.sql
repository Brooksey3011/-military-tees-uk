-- Function to send welcome email when a new user signs up
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS trigger AS $$
DECLARE
  webhook_url TEXT := 'https://militarytees.co.uk/api/auth/welcome';
  request_id bigint;
BEGIN
  -- Only send welcome email for new user signups (not password resets, etc.)
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Log the welcome email trigger
    RAISE LOG 'Triggering welcome email for user: %', NEW.email;
    
    -- Make HTTP request to our welcome email API
    SELECT INTO request_id net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        'created_at', NEW.created_at
      )::text
    );
    
    RAISE LOG 'Welcome email webhook triggered with request_id: %', request_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON auth.users;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- Note: This trigger will fire when:
-- 1. A new user signs up and confirms their email
-- 2. An existing user confirms their email for the first time
-- 
-- To deploy this:
-- 1. Update the webhook_url with your actual domain
-- 2. Run this SQL in your Supabase SQL Editor
-- 3. Ensure the pg_net extension is enabled for HTTP requests