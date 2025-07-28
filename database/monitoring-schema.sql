-- Monitoring and Analytics Database Schema for Military Tees UK
-- This file contains all tables needed for error tracking, analytics, and performance monitoring

-- ==============================================
-- Error Logging Tables
-- ==============================================

-- Error logs table for tracking application errors
CREATE TABLE IF NOT EXISTS error_logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('low', 'medium', 'high', 'critical')),
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  session_id VARCHAR(255),
  
  -- Request context
  user_agent TEXT,
  url TEXT,
  
  -- Application context
  environment VARCHAR(50) DEFAULT 'production',
  service VARCHAR(100) DEFAULT 'military-tees-uk',
  version VARCHAR(50) DEFAULT '1.0.0',
  
  -- Additional data
  tags JSONB DEFAULT '{}',
  extra_data JSONB DEFAULT '{}',
  fingerprint TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Indexes
  CONSTRAINT error_logs_level_check CHECK (level IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_environment ON error_logs(environment);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(resolved_at) WHERE resolved_at IS NULL;

-- ==============================================
-- Analytics Tables
-- ==============================================

-- Page views tracking
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  referrer TEXT,
  user_agent TEXT,
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional tracking data
  ip_address INET,
  country VARCHAR(2),
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50)
);

-- Indexes for page views
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_timestamp ON analytics_pageviews(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_user_id ON analytics_pageviews(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_session_id ON analytics_pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_url ON analytics_pageviews(url);

-- Custom events tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  properties JSONB DEFAULT '{}',
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  url TEXT,
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Conversion tracking
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id BIGSERIAL PRIMARY KEY,
  conversion_type VARCHAR(100) NOT NULL,
  value DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GBP',
  order_id VARCHAR(255),
  items JSONB DEFAULT '[]',
  properties JSONB DEFAULT '{}',
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversions
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_timestamp ON analytics_conversions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_type ON analytics_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_user_id ON analytics_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_order_id ON analytics_conversions(order_id);

-- ==============================================
-- Performance Monitoring Tables
-- ==============================================

-- Performance metrics tracking
CREATE TABLE IF NOT EXISTS analytics_performance (
  id BIGSERIAL PRIMARY KEY,
  url TEXT,
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Web Vitals metrics (in milliseconds)
  fcp DECIMAL(10,2), -- First Contentful Paint
  lcp DECIMAL(10,2), -- Largest Contentful Paint
  fid DECIMAL(10,2), -- First Input Delay
  cls DECIMAL(6,4),  -- Cumulative Layout Shift (score)
  ttfb DECIMAL(10,2), -- Time to First Byte
  
  -- Custom performance metrics (in milliseconds)
  page_load_time DECIMAL(10,2),
  api_response_time DECIMAL(10,2),
  search_response_time DECIMAL(10,2),
  checkout_time DECIMAL(10,2),
  
  -- Technical metrics
  memory_usage DECIMAL(10,2), -- in MB
  connection_type VARCHAR(50),
  device_type VARCHAR(20),
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_analytics_performance_timestamp ON analytics_performance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_url ON analytics_performance(url);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_user_id ON analytics_performance(user_id);

-- General performance metrics table for custom metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  unit VARCHAR(20) NOT NULL CHECK (unit IN ('ms', 'bytes', 'count', 'percentage')),
  tags JSONB DEFAULT '{}',
  
  -- Application context
  environment VARCHAR(50) DEFAULT 'production',
  service VARCHAR(100) DEFAULT 'military-tees-uk',
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_environment ON performance_metrics(environment);

-- ==============================================
-- Monitoring Views for Analytics
-- ==============================================

-- View for error summary by level and time
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  level,
  environment,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY level, environment, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- View for page view analytics
CREATE OR REPLACE VIEW pageview_analytics AS
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_pageviews
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- View for conversion analytics
CREATE OR REPLACE VIEW conversion_analytics AS
SELECT 
  conversion_type,
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as conversion_count,
  SUM(value) as total_value,
  AVG(value) as average_value,
  COUNT(DISTINCT user_id) as unique_converters
FROM analytics_conversions
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY conversion_type, DATE_TRUNC('day', timestamp)
ORDER BY date DESC, conversion_type;

-- View for performance monitoring
CREATE OR REPLACE VIEW performance_overview AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(lcp) as avg_lcp,
  AVG(fcp) as avg_fcp,
  AVG(fid) as avg_fid,
  AVG(cls) as avg_cls,
  AVG(page_load_time) as avg_page_load_time,
  COUNT(*) as sample_count
FROM analytics_performance
WHERE timestamp >= NOW() - INTERVAL '24 hours'
  AND lcp IS NOT NULL
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- ==============================================
-- Row Level Security (RLS) Policies
-- ==============================================

-- Enable RLS on all monitoring tables
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy for service role to access all monitoring data
CREATE POLICY "Service role can access error logs" ON error_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access pageviews" ON analytics_pageviews
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access events" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access conversions" ON analytics_conversions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access performance" ON analytics_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access performance metrics" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for admin users to view monitoring data
CREATE POLICY "Admin users can view error logs" ON error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can view analytics" ON analytics_pageviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ==============================================
-- Functions for Monitoring
-- ==============================================

-- Function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Delete old error logs (keep 90 days)
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND level IN ('low', 'medium');
    
  -- Keep critical errors for 1 year
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '1 year'
    AND level = 'critical';
  
  -- Delete old page views (keep 6 months)
  DELETE FROM analytics_pageviews 
  WHERE timestamp < NOW() - INTERVAL '6 months';
  
  -- Delete old events (keep 6 months)
  DELETE FROM analytics_events 
  WHERE timestamp < NOW() - INTERVAL '6 months';
  
  -- Keep conversions for 2 years
  DELETE FROM analytics_conversions 
  WHERE timestamp < NOW() - INTERVAL '2 years';
  
  -- Delete old performance data (keep 30 days)
  DELETE FROM analytics_performance 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete old performance metrics (keep 90 days)
  DELETE FROM performance_metrics 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Log cleanup completion
  INSERT INTO error_logs (message, level, environment, service)
  VALUES ('Monitoring data cleanup completed', 'low', 'system', 'cleanup-job');
END;
$$ LANGUAGE plpgsql;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(time_period INTERVAL DEFAULT INTERVAL '24 hours')
RETURNS TABLE (
  level VARCHAR(20),
  count BIGINT,
  unique_users BIGINT,
  latest_error TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.level,
    COUNT(*) as count,
    COUNT(DISTINCT e.user_id) as unique_users,
    MAX(e.created_at) as latest_error
  FROM error_logs e
  WHERE e.created_at >= NOW() - time_period
  GROUP BY e.level
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- Scheduled Jobs (for pg_cron if available)
-- ==============================================

-- Schedule daily cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-monitoring', '0 2 * * *', 'SELECT cleanup_monitoring_data();');