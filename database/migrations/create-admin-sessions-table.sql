-- Create admin_sessions table for secure session management
-- This enables server-side session tracking and revocation

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can manage their own sessions" ON public.admin_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all admin sessions" ON public.admin_sessions
    FOR ALL TO service_role
    USING (true);

-- Create indexes for performance
CREATE INDEX admin_sessions_user_id_idx ON public.admin_sessions(user_id);
CREATE INDEX admin_sessions_session_id_idx ON public.admin_sessions(session_id);
CREATE INDEX admin_sessions_expires_at_idx ON public.admin_sessions(expires_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admin_sessions_updated_at ON public.admin_sessions;
CREATE TRIGGER update_admin_sessions_updated_at
    BEFORE UPDATE ON public.admin_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.admin_sessions IS 'Secure server-side session storage for admin users with revocation capability';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_sessions TO service_role;