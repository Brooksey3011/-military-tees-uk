-- ====================================================================
-- MILITARY TEES UK - COMPLETE DATABASE SCHEMA UPDATE
-- ====================================================================
-- Execute this entire script in Supabase Dashboard → SQL Editor
-- This will fully activate your enhanced order management system
-- ====================================================================

BEGIN;

-- Step 1: Add inventory tracking columns to product_variants
-- These columns enable advanced inventory management
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 200;

-- Step 2: Add enhanced order tracking columns to orders
-- These columns enable order lifecycle tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipping_address_type TEXT DEFAULT 'standard';

-- Step 3: Create shipping_rates table for dynamic rate management
-- This enables BFPO and multi-carrier shipping management
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_code TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'express', 'bfpo_standard', 'bfpo_express')),
  service_name TEXT NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL,
  free_shipping_threshold DECIMAL(10,2),
  min_delivery_days INTEGER NOT NULL,
  max_delivery_days INTEGER NOT NULL,
  countries TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(zone_code, service_type)
);

-- Step 4: Create inventory_movements table for stock audit trail
-- This tracks all inventory changes (sales, returns, adjustments)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'return', 'adjustment', 'restock')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT CHECK (reference_type IN ('order', 'adjustment', 'restock', 'return')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create order_status_history table for order lifecycle tracking
-- This logs all order status changes for audit purposes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  previous_fulfillment_status TEXT,
  new_fulfillment_status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create email_notifications table for tracking sent emails
-- This tracks all automated emails sent by the system
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('order_confirmation', 'payment_received', 'shipped', 'delivered', 'cancelled')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_service TEXT CHECK (email_service IN ('hostinger', 'resend')),
  message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Update existing product_variants with inventory defaults
-- This sets up inventory tracking for all existing products
UPDATE product_variants 
SET 
  low_stock_threshold = COALESCE(low_stock_threshold, 5),
  track_inventory = COALESCE(track_inventory, true),
  weight_grams = COALESCE(weight_grams, 200),
  updated_at = NOW()
WHERE id IS NOT NULL;

-- Step 8: Insert initial shipping rates for UK and BFPO
-- This populates the shipping system with military-focused rates
INSERT INTO shipping_rates (zone_code, zone_name, service_type, service_name, base_rate, free_shipping_threshold, min_delivery_days, max_delivery_days, countries) VALUES
-- UK Standard Rates
('UK', 'United Kingdom', 'standard', 'Royal Mail Standard', 4.99, 50.00, 3, 7, ARRAY['GB']),
('UK', 'United Kingdom', 'express', 'Royal Mail Express', 9.99, 50.00, 1, 2, ARRAY['GB']),

-- BFPO Military Rates (Lower thresholds for service members)
('BFPO', 'British Forces Post Office', 'bfpo_standard', 'BFPO Standard Post', 3.99, 40.00, 5, 14, ARRAY['BFPO']),
('BFPO', 'British Forces Post Office', 'bfpo_express', 'BFPO Priority Post', 8.99, 40.00, 3, 7, ARRAY['BFPO']),

-- EU Rates
('EU', 'European Union', 'standard', 'European Standard', 12.99, 75.00, 5, 10, ARRAY['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI']),
('EU', 'European Union', 'express', 'European Express', 24.99, 75.00, 2, 4, ARRAY['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI'])

ON CONFLICT (zone_code, service_type) DO NOTHING;

-- Step 9: Create performance indexes
-- These optimize queries for the enhanced system
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_track_inventory ON product_variants(track_inventory);
CREATE INDEX IF NOT EXISTS idx_product_variants_low_stock ON product_variants(low_stock_threshold);

CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_type ON orders(shipping_address_type);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON shipping_rates(zone_code);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_active ON shipping_rates(is_active);

CREATE INDEX IF NOT EXISTS idx_email_notifications_order ON email_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);

-- Step 10: Create triggers for automation
-- Trigger to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status) THEN
    INSERT INTO order_status_history (
      order_id,
      previous_status,
      new_status,
      previous_fulfillment_status,
      new_fulfillment_status,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      OLD.fulfillment_status,
      NEW.fulfillment_status,
      'Status updated from ' || COALESCE(OLD.status, 'null') || '/' || COALESCE(OLD.fulfillment_status, 'null') || 
      ' to ' || NEW.status || '/' || NEW.fulfillment_status
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Step 11: Set up Row Level Security (RLS) for new tables
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Inventory movements - service role can manage all
CREATE POLICY "Service role can manage inventory movements" ON inventory_movements
  FOR ALL USING (auth.role() = 'service_role');

-- Order status history - users can view their own, service role can manage all
CREATE POLICY "Users can view their order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage order status history" ON order_status_history
  FOR ALL USING (auth.role() = 'service_role');

-- Shipping rates - public read, service role can manage
CREATE POLICY "Anyone can view active shipping rates" ON shipping_rates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage shipping rates" ON shipping_rates
  FOR ALL USING (auth.role() = 'service_role');

-- Email notifications - service role only
CREATE POLICY "Service role can manage email notifications" ON email_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON inventory_movements TO service_role;
GRANT ALL ON order_status_history TO service_role;
GRANT ALL ON shipping_rates TO service_role;
GRANT ALL ON email_notifications TO service_role;

GRANT SELECT ON inventory_movements TO authenticated;
GRANT SELECT ON order_status_history TO authenticated;
GRANT SELECT ON shipping_rates TO authenticated, anon;

COMMIT;

-- ====================================================================
-- VERIFICATION QUERIES - Run these to confirm everything worked
-- ====================================================================

-- Check product_variants columns
SELECT 'product_variants columns' as table_info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

-- Check orders columns  
SELECT 'orders columns' as table_info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check new tables exist
SELECT 'shipping_rates count' as info, COUNT(*) as count FROM shipping_rates;
SELECT 'inventory_movements table' as info, COUNT(*) as count FROM inventory_movements;
SELECT 'order_status_history table' as info, COUNT(*) as count FROM order_status_history;
SELECT 'email_notifications table' as info, COUNT(*) as count FROM email_notifications;

-- Check low stock variants (should work now)
SELECT 'low_stock_variants' as info, COUNT(*) as count 
FROM product_variants 
WHERE stock_quantity <= low_stock_threshold AND track_inventory = true;

-- Success confirmation
SELECT '🛡️ MILITARY TEES UK ENHANCED ORDER SYSTEM - SCHEMA UPDATE COMPLETE!' as status;
SELECT '✅ All enhanced features now available' as result;
SELECT '🚀 Ready for military e-commerce operations' as ready;