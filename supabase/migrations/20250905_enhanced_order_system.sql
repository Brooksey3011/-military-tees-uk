-- Enhanced Order Management System Migration
-- Adds comprehensive order status tracking, inventory management, and BFPO shipping support

-- Update orders table with enhanced status tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending' 
  CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_type TEXT DEFAULT 'standard' 
  CHECK (shipping_address_type IN ('standard', 'bfpo', 'po_box'));

-- Update product_variants table for proper inventory management
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 200;

-- Create inventory_movements table for stock tracking
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'return', 'adjustment', 'restock')),
  quantity_change INTEGER NOT NULL, -- positive for increase, negative for decrease
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id TEXT, -- order number, adjustment reference, etc.
  reference_type TEXT CHECK (reference_type IN ('order', 'adjustment', 'restock', 'return')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create order_status_history table for tracking status changes
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

-- Create shipping_rates table for dynamic rate management
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
  weight_limit_grams INTEGER,
  countries TEXT[], -- array of country codes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial shipping rates including BFPO
INSERT INTO shipping_rates (zone_code, zone_name, service_type, service_name, base_rate, free_shipping_threshold, min_delivery_days, max_delivery_days, countries) VALUES
-- UK Standard Rates
('UK', 'United Kingdom', 'standard', 'Royal Mail Standard', 4.99, 50.00, 3, 7, ARRAY['GB']),
('UK', 'United Kingdom', 'express', 'Royal Mail Express', 9.99, 50.00, 1, 2, ARRAY['GB']),

-- BFPO Rates (British Forces Post Office)
('BFPO', 'British Forces Post Office', 'bfpo_standard', 'BFPO Standard Post', 3.99, 40.00, 5, 14, ARRAY['BFPO']),
('BFPO', 'British Forces Post Office', 'bfpo_express', 'BFPO Priority Post', 8.99, 40.00, 3, 7, ARRAY['BFPO']),

-- EU Rates
('EU', 'European Union', 'standard', 'European Standard', 12.99, 75.00, 5, 10, ARRAY['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI']),
('EU', 'European Union', 'express', 'European Express', 24.99, 75.00, 2, 4, ARRAY['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI']),

-- North America
('NA', 'North America', 'standard', 'International Standard', 15.99, 100.00, 7, 14, ARRAY['US', 'CA']),
('NA', 'North America', 'express', 'International Express', 29.99, 100.00, 3, 5, ARRAY['US', 'CA']),

-- World
('WORLD', 'Rest of World', 'standard', 'Global Standard', 19.99, 150.00, 14, 21, ARRAY['*']),
('WORLD', 'Rest of World', 'express', 'Global Express', 39.99, 150.00, 7, 14, ARRAY['*']);

-- Create email_notifications table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('order_confirmation', 'payment_received', 'order_processing', 'shipped', 'delivered', 'cancelled')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_service TEXT CHECK (email_service IN ('hostinger', 'resend')),
  message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_type ON orders(shipping_address_type);

CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_track_inventory ON product_variants(track_inventory);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON shipping_rates(zone_code);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_active ON shipping_rates(is_active);

CREATE INDEX IF NOT EXISTS idx_email_notifications_order ON email_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shipping_rates_updated_at
  BEFORE UPDATE ON shipping_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update inventory after order placement
CREATE OR REPLACE FUNCTION process_inventory_for_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when order status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Deduct inventory for each order item
    INSERT INTO inventory_movements (
      product_variant_id,
      movement_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reference_id,
      reference_type,
      notes
    )
    SELECT 
      oi.product_variant_id,
      'sale',
      -oi.quantity,
      pv.stock_quantity,
      pv.stock_quantity - oi.quantity,
      NEW.order_number,
      'order',
      'Inventory deducted for order ' || NEW.order_number
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = NEW.id AND pv.track_inventory = true;

    -- Update stock quantities
    UPDATE product_variants
    SET stock_quantity = stock_quantity - (
      SELECT quantity FROM order_items 
      WHERE order_id = NEW.id AND product_variant_id = product_variants.id
    )
    WHERE id IN (
      SELECT product_variant_id FROM order_items 
      WHERE order_id = NEW.id
    ) AND track_inventory = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_inventory_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION process_inventory_for_order();

-- Function to log order status changes
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

CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Row Level Security Policies
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Inventory movements - service role only
CREATE POLICY "Service role can manage inventory movements" ON inventory_movements
  FOR ALL USING (auth.role() = 'service_role');

-- Order status history - users can view their own, service role can manage all
CREATE POLICY "Users can view their order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.customer_email = auth.email()
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

-- Grant necessary permissions
GRANT ALL ON inventory_movements TO service_role;
GRANT ALL ON order_status_history TO service_role;
GRANT ALL ON shipping_rates TO service_role;
GRANT ALL ON email_notifications TO service_role;

GRANT SELECT ON inventory_movements TO authenticated;
GRANT SELECT ON order_status_history TO authenticated;
GRANT SELECT ON shipping_rates TO authenticated, anon;
GRANT SELECT ON email_notifications TO authenticated;

-- Update existing product variants with default stock values (if any exist)
UPDATE product_variants 
SET stock_quantity = 50, track_inventory = true, weight_grams = 200 
WHERE stock_quantity IS NULL;