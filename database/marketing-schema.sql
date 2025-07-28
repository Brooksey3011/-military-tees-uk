-- =============================================
-- Military Tees UK - Marketing System Schema
-- =============================================

-- Enable RLS for security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 1. Abandoned Carts Table
CREATE TABLE abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_id UUID REFERENCES auth.users(id),
    cart_data JSONB NOT NULL DEFAULT '{}',
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    cart_created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    recovered_at TIMESTAMPTZ,
    recovery_email_sent_at TIMESTAMPTZ,
    recovery_email_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'recovered', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Email Campaigns Table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('newsletter', 'promotional', 'abandoned_cart', 'welcome', 'product_announcement')),
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    template_data JSONB DEFAULT '{}',
    sender_email VARCHAR(255) DEFAULT 'info@militarytees.co.uk',
    sender_name VARCHAR(255) DEFAULT 'Military Tees UK',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Email Campaign Recipients Table
CREATE TABLE email_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    personalization_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    source VARCHAR(100) DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{"frequency": "weekly", "topics": ["new_products", "sales", "military_news"]}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customer Segments Table
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- JSON criteria for segment membership
    is_dynamic BOOLEAN DEFAULT true,
    customer_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customer Segment Memberships Table
CREATE TABLE customer_segment_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID REFERENCES customer_segments(id) ON DELETE CASCADE,  
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    removed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(segment_id, customer_id)
);

-- 7. Marketing Automation Rules Table
CREATE TABLE marketing_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL CHECK (trigger_type IN ('cart_abandoned', 'first_purchase', 'repeat_purchase', 'birthday', 'time_based', 'behavior')),
    trigger_criteria JSONB NOT NULL,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('send_email', 'add_to_segment', 'send_sms', 'create_discount')),
    action_config JSONB NOT NULL,
    delay_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Marketing Automation Executions Table
CREATE TABLE marketing_automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES marketing_automation_rules(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id),
    trigger_data JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    error_message TEXT,
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. A/B Test Campaigns Table
CREATE TABLE ab_test_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(100) NOT NULL CHECK (test_type IN ('email_subject', 'email_content', 'send_time', 'sender_name')),
    variant_a_config JSONB NOT NULL,
    variant_b_config JSONB NOT NULL,
    traffic_split DECIMAL(3,2) DEFAULT 0.50 CHECK (traffic_split > 0 AND traffic_split < 1),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    winner_variant VARCHAR(1) CHECK (winner_variant IN ('A', 'B')),
    statistical_significance DECIMAL(5,4),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. A/B Test Results Table
CREATE TABLE ab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
    variant VARCHAR(1) NOT NULL CHECK (variant IN ('A', 'B')),
    recipient_email VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for Performance
-- =============================================

-- Abandoned Carts
CREATE INDEX idx_abandoned_carts_session ON abandoned_carts(session_id);
CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(customer_email);
CREATE INDEX idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_created ON abandoned_carts(cart_created_at);

-- Email Campaigns
CREATE INDEX idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);

-- Newsletter Subscribers
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscribers(subscribed_at);

-- Automation Rules
CREATE INDEX idx_automation_rules_trigger ON marketing_automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_active ON marketing_automation_rules(is_active);

-- Automation Executions
CREATE INDEX idx_automation_executions_rule ON marketing_automation_executions(rule_id);
CREATE INDEX idx_automation_executions_customer ON marketing_automation_executions(customer_id);
CREATE INDEX idx_automation_executions_status ON marketing_automation_executions(status);
CREATE INDEX idx_automation_executions_scheduled ON marketing_automation_executions(scheduled_for);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Admin can access everything
CREATE POLICY admin_all_access_abandoned_carts ON abandoned_carts FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_email_campaigns ON email_campaigns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_email_recipients ON email_campaign_recipients FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_newsletter ON newsletter_subscribers FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_segments ON customer_segments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_segment_memberships ON customer_segment_memberships FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_automation_rules ON marketing_automation_rules FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_automation_executions ON marketing_automation_executions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_ab_campaigns ON ab_test_campaigns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY admin_all_access_ab_results ON ab_test_results FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Public access for newsletter subscriptions
CREATE POLICY public_newsletter_insert ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to update abandoned cart last_updated_at
CREATE OR REPLACE FUNCTION update_abandoned_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_abandoned_cart_timestamp
    BEFORE UPDATE ON abandoned_carts
    FOR EACH ROW
    EXECUTE FUNCTION update_abandoned_cart_timestamp();

-- Function to calculate cart total value from cart_data
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_data JSONB)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total DECIMAL(10,2) := 0;
    item JSONB;
BEGIN
    FOR item IN SELECT jsonb_array_elements(cart_data->'items')
    LOOP
        total := total + ((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER);
    END LOOP;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update segment customer counts
CREATE OR REPLACE FUNCTION update_segment_customer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE customer_segments 
        SET customer_count = customer_count + 1,
            last_updated = NOW()
        WHERE id = NEW.segment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE customer_segments 
        SET customer_count = customer_count - 1,
            last_updated = NOW()
        WHERE id = OLD.segment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_segment_count
    AFTER INSERT OR DELETE ON customer_segment_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_segment_customer_count();

-- Function to create default automation rules
CREATE OR REPLACE FUNCTION create_default_automation_rules()
RETURNS VOID AS $$
BEGIN
    -- Abandoned Cart Recovery (1 hour delay)
    INSERT INTO marketing_automation_rules (
        name, description, trigger_type, trigger_criteria,
        action_type, action_config, delay_minutes, is_active
    ) VALUES (
        'Abandoned Cart Recovery - 1 Hour',
        'Send recovery email 1 hour after cart abandonment',
        'cart_abandoned',
        '{"min_cart_value": 10, "max_email_count": 0}',
        'send_email',
        '{"template": "abandoned_cart_recovery", "subject": "Don't forget your Military Tees! 🛡️"}',
        60,
        true
    );

    -- Abandoned Cart Follow-up (24 hours)
    INSERT INTO marketing_automation_rules (
        name, description, trigger_type, trigger_criteria,
        action_type, action_config, delay_minutes, is_active
    ) VALUES (
        'Abandoned Cart Follow-up - 24 Hours',
        'Send follow-up email 24 hours after cart abandonment',
        'cart_abandoned',
        '{"min_cart_value": 10, "max_email_count": 1}',
        'send_email',
        '{"template": "abandoned_cart_followup", "subject": "Still thinking about your Military Tees order? 🎖️"}',
        1440,
        true
    );

    -- Welcome Email for New Customers
    INSERT INTO marketing_automation_rules (
        name, description, trigger_type, trigger_criteria,
        action_type, action_config, delay_minutes, is_active
    ) VALUES (
        'Welcome Email for New Customers',
        'Send welcome email immediately after first purchase',
        'first_purchase',
        '{}',
        'send_email',
        '{"template": "welcome_customer", "subject": "Welcome to the Military Tees UK Family! 🛡️"}',
        0,
        true
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get abandoned carts ready for recovery
CREATE OR REPLACE FUNCTION get_abandoned_carts_for_recovery(
    hours_since_abandonment INTEGER DEFAULT 1,
    max_emails_sent INTEGER DEFAULT 2
)
RETURNS TABLE (
    cart_id UUID,
    session_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_id UUID,
    cart_data JSONB,
    total_value DECIMAL(10,2),
    abandoned_hours_ago INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.session_id,
        ac.customer_email,
        ac.customer_id,
        ac.cart_data,
        ac.total_value,
        NOW() - ac.cart_created_at
    FROM abandoned_carts ac
    WHERE ac.status = 'abandoned'
        AND ac.customer_email IS NOT NULL
        AND ac.total_value > 0
        AND ac.recovery_email_count < max_emails_sent
        AND ac.cart_created_at <= NOW() - INTERVAL '1 hour' * hours_since_abandonment
        AND (ac.recovery_email_sent_at IS NULL OR 
             ac.recovery_email_sent_at <= NOW() - INTERVAL '24 hours')
    ORDER BY ac.cart_created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Initialize default automation rules
SELECT create_default_automation_rules();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Sample customer segments
INSERT INTO customer_segments (name, description, criteria) VALUES
('High Value Customers', 'Customers who have spent over £200', '{"min_total_spent": 200}'),
('Frequent Buyers', 'Customers with 3+ orders', '{"min_order_count": 3}'),
('Military Veterans', 'Verified military veterans', '{"tags": ["veteran"]}'),
('Newsletter Subscribers', 'Active newsletter subscribers', '{"newsletter_active": true}');

-- Sample marketing automation rules are created by the function above

COMMENT ON TABLE abandoned_carts IS 'Tracks abandoned shopping carts for recovery campaigns';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns and their performance metrics';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management';
COMMENT ON TABLE customer_segments IS 'Customer segmentation for targeted marketing';
COMMENT ON TABLE marketing_automation_rules IS 'Rules for automated marketing actions';
COMMENT ON TABLE ab_test_campaigns IS 'A/B testing framework for email campaigns';