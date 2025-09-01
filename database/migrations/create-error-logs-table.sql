-- Create error_logs table for centralized error tracking and monitoring
-- This enables comprehensive error logging, monitoring, and alerting

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('validation', 'authentication', 'authorization', 'not_found', 'rate_limit', 'database', 'external_api', 'internal')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    stack TEXT,
    endpoint TEXT,
    method TEXT CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    details JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can view error logs
CREATE POLICY "Only admins can view error logs" ON public.error_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can manage error logs" ON public.error_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Service role can manage all error logs" ON public.error_logs
    FOR ALL TO service_role
    USING (true);

-- Create indexes for performance
CREATE INDEX error_logs_timestamp_idx ON public.error_logs(timestamp DESC);
CREATE INDEX error_logs_type_idx ON public.error_logs(type);
CREATE INDEX error_logs_severity_idx ON public.error_logs(severity);
CREATE INDEX error_logs_endpoint_idx ON public.error_logs(endpoint);
CREATE INDEX error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX error_logs_resolved_idx ON public.error_logs(resolved) WHERE resolved = false;
CREATE INDEX error_logs_severity_unresolved_idx ON public.error_logs(severity, resolved) WHERE resolved = false;

-- Composite index for common queries
CREATE INDEX error_logs_severity_timestamp_idx ON public.error_logs(severity, timestamp DESC);
CREATE INDEX error_logs_type_timestamp_idx ON public.error_logs(type, timestamp DESC);

-- Add updated_at trigger
CREATE TRIGGER update_error_logs_updated_at
    BEFORE UPDATE ON public.error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.error_logs IS 'Centralized error logging for monitoring, alerting, and debugging purposes';

-- Grant necessary permissions
GRANT SELECT ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;

-- Create view for error statistics (admins only)
CREATE VIEW public.error_stats AS
SELECT 
    type,
    severity,
    DATE_TRUNC('day', timestamp) as error_date,
    COUNT(*) as error_count,
    COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
    MAX(timestamp) as latest_occurrence
FROM public.error_logs
GROUP BY type, severity, DATE_TRUNC('day', timestamp)
ORDER BY error_date DESC, severity DESC;

-- RLS for error stats view
ALTER VIEW public.error_stats SET (security_barrier = true);

-- Grant access to error stats view
GRANT SELECT ON public.error_stats TO authenticated;

-- Create function to mark errors as resolved
CREATE OR REPLACE FUNCTION resolve_error(
    error_id UUID,
    resolution_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Update error as resolved
    UPDATE public.error_logs 
    SET 
        resolved = true,
        resolved_at = NOW(),
        resolved_by = auth.uid(),
        resolution_notes = resolve_error.resolution_notes,
        updated_at = NOW()
    WHERE id = error_id;

    RETURN FOUND;
END;
$$;

-- Grant execute permission on resolve function
GRANT EXECUTE ON FUNCTION resolve_error(UUID, TEXT) TO authenticated;