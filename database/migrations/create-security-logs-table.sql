-- Create security_logs table for monitoring security incidents
-- This enables tracking of security events across the application

CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_type TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can view security logs
CREATE POLICY "Only admins can view security logs" ON public.security_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only service role can manage security logs" ON public.security_logs
    FOR ALL TO service_role
    USING (true);

-- Create indexes for performance
CREATE INDEX security_logs_incident_type_idx ON public.security_logs(incident_type);
CREATE INDEX security_logs_severity_idx ON public.security_logs(severity);
CREATE INDEX security_logs_source_idx ON public.security_logs(source);
CREATE INDEX security_logs_created_at_idx ON public.security_logs(created_at);
CREATE INDEX security_logs_resolved_idx ON public.security_logs(resolved) WHERE resolved = false;

-- Add updated_at trigger
CREATE TRIGGER update_security_logs_updated_at
    BEFORE UPDATE ON public.security_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.security_logs IS 'Security incident logging for monitoring and alerting purposes';

-- Grant necessary permissions
GRANT SELECT ON public.security_logs TO authenticated;
GRANT ALL ON public.security_logs TO service_role;