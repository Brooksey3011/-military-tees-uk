-- Inventory Management Database Schema for Military Tees UK
-- This file contains all tables and views needed for comprehensive inventory management

-- ==============================================
-- Core Inventory Tables
-- ==============================================

-- Add inventory-specific columns to existing product_variants table
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 100;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS last_restocked_at TIMESTAMPTZ;

-- Inventory movements tracking table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'damage', 'transfer')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id VARCHAR(255), -- Order ID, adjustment ID, etc.
  reason VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for inventory movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_id);

-- Low stock alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  variant_details JSONB NOT NULL DEFAULT '{}',
  current_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  suggested_reorder_quantity INTEGER NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for low stock alerts
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_variant_id ON low_stock_alerts(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_priority ON low_stock_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_acknowledged ON low_stock_alerts(acknowledged_at);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_created_at ON low_stock_alerts(created_at DESC);

-- Stock reservations table (for pending orders)
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reserved_for VARCHAR(255) NOT NULL, -- Order ID, cart session, etc.
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for stock reservations
CREATE INDEX IF NOT EXISTS idx_stock_reservations_variant_id ON stock_reservations(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_reserved_for ON stock_reservations(reserved_for);

-- ==============================================
-- Inventory Views
-- ==============================================

-- Comprehensive inventory view with calculated fields
CREATE OR REPLACE VIEW inventory_view AS
SELECT 
  pv.id as variant_id,
  p.id as product_id,
  p.name as product_name,
  p.category_id,
  c.name as category,
  pv.sku,
  pv.size,
  pv.color,
  jsonb_build_object(
    'size', pv.size,
    'color', pv.color
  ) as variant_details,
  
  -- Stock levels
  pv.stock_quantity as current_stock,
  COALESCE(reservations.reserved_quantity, 0) as reserved_stock,
  (pv.stock_quantity - COALESCE(reservations.reserved_quantity, 0)) as available_stock,
  
  -- Inventory settings
  pv.reorder_point,
  pv.max_stock_level,
  pv.cost_price,
  pv.supplier_info,
  pv.last_restocked_at,
  
  -- Timestamps
  pv.created_at,
  pv.updated_at
  
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN (
  SELECT 
    product_variant_id,
    SUM(quantity) as reserved_quantity
  FROM stock_reservations
  WHERE expires_at > NOW()
  GROUP BY product_variant_id
) reservations ON pv.id = reservations.product_variant_id
WHERE pv.is_active = true;

-- Inventory statistics view
CREATE OR REPLACE VIEW inventory_stats_view AS
SELECT 
  COUNT(DISTINCT p.id) as total_products,
  COUNT(pv.id) as total_variants,
  COUNT(CASE WHEN pv.stock_quantity <= pv.reorder_point THEN 1 END) as low_stock_items,
  COUNT(CASE WHEN pv.stock_quantity = 0 THEN 1 END) as out_of_stock_items,
  SUM(pv.stock_quantity * COALESCE(pv.cost_price, 0)) as total_inventory_value
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.is_active = true;

-- Stock movement summary view
CREATE OR REPLACE VIEW stock_movement_summary AS
SELECT 
  pv.id as variant_id,
  p.name as product_name,
  pv.sku,
  pv.stock_quantity as current_stock,
  
  -- Movement counts by type (last 30 days)
  COUNT(CASE WHEN im.movement_type = 'sale' AND im.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as sales_30d,
  COUNT(CASE WHEN im.movement_type = 'restock' AND im.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as restocks_30d,
  COUNT(CASE WHEN im.movement_type = 'adjustment' AND im.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as adjustments_30d,
  
  -- Movement quantities by type (last 30 days)
  SUM(CASE WHEN im.movement_type = 'sale' AND im.created_at >= NOW() - INTERVAL '30 days' THEN ABS(im.quantity_change) ELSE 0 END) as total_sales_30d,
  SUM(CASE WHEN im.movement_type = 'restock' AND im.created_at >= NOW() - INTERVAL '30 days' THEN im.quantity_change ELSE 0 END) as total_restocked_30d,
  
  -- Last movement
  MAX(im.created_at) as last_movement_at
  
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
LEFT JOIN inventory_movements im ON pv.id = im.product_variant_id
WHERE pv.is_active = true
GROUP BY pv.id, p.name, pv.sku, pv.stock_quantity;

-- ==============================================
-- Inventory Functions
-- ==============================================

-- Function to reserve stock for orders
CREATE OR REPLACE FUNCTION reserve_stock(
  variant_id UUID,
  reserve_quantity INTEGER,
  reserved_for_id VARCHAR(255),
  expiry_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  -- Get available stock (current stock minus existing reservations)
  SELECT (pv.stock_quantity - COALESCE(reservations.reserved_quantity, 0))
  INTO available_stock
  FROM product_variants pv
  LEFT JOIN (
    SELECT 
      product_variant_id,
      SUM(quantity) as reserved_quantity
    FROM stock_reservations
    WHERE expires_at > NOW()
    GROUP BY product_variant_id
  ) reservations ON pv.id = reservations.product_variant_id
  WHERE pv.id = variant_id;
  
  -- Check if enough stock is available
  IF available_stock < reserve_quantity THEN
    RETURN FALSE;
  END IF;
  
  -- Create reservation
  INSERT INTO stock_reservations (
    product_variant_id,
    quantity,
    reserved_for,
    expires_at
  ) VALUES (
    variant_id,
    reserve_quantity,
    reserved_for_id,
    NOW() + (expiry_minutes || ' minutes')::INTERVAL
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to release stock reservation
CREATE OR REPLACE FUNCTION release_stock_reservation(reserved_for_id VARCHAR(255))
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER;
BEGIN
  DELETE FROM stock_reservations
  WHERE reserved_for = reserved_for_id;
  
  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  DELETE FROM stock_reservations
  WHERE expires_at <= NOW();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Log cleanup if any reservations were removed
  IF cleaned_count > 0 THEN
    INSERT INTO inventory_movements (
      product_variant_id,
      movement_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason,
      notes
    )
    SELECT 
      '00000000-0000-0000-0000-000000000000'::UUID, -- System UUID
      'adjustment',
      0,
      0,
      0,
      'Cleanup expired reservations',
      'Cleaned up ' || cleaned_count || ' expired stock reservations'
    WHERE NOT EXISTS (
      SELECT 1 FROM inventory_movements 
      WHERE reason = 'Cleanup expired reservations' 
      AND created_at > NOW() - INTERVAL '1 hour'
    );
  END IF;
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create low stock alerts
CREATE OR REPLACE FUNCTION check_and_create_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
  alert_count INTEGER := 0;
  item_record RECORD;
  alert_priority VARCHAR(20);
  suggested_quantity INTEGER;
BEGIN
  -- Find items that need alerts
  FOR item_record IN 
    SELECT 
      pv.id as variant_id,
      p.name as product_name,
      pv.stock_quantity,
      pv.reorder_point,
      pv.max_stock_level,
      jsonb_build_object('size', pv.size, 'color', pv.color) as variant_details
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.is_active = true
    AND pv.stock_quantity <= pv.reorder_point
    AND NOT EXISTS (
      SELECT 1 FROM low_stock_alerts lsa
      WHERE lsa.product_variant_id = pv.id
      AND lsa.acknowledged_at IS NULL
    )
  LOOP
    -- Determine priority
    IF item_record.stock_quantity = 0 THEN
      alert_priority := 'critical';
    ELSIF item_record.stock_quantity <= (item_record.reorder_point * 0.5) THEN
      alert_priority := 'high';
    ELSIF item_record.stock_quantity <= (item_record.reorder_point * 0.75) THEN
      alert_priority := 'medium';
    ELSE
      alert_priority := 'low';
    END IF;
    
    -- Calculate suggested reorder quantity
    suggested_quantity := GREATEST(
      item_record.max_stock_level - item_record.stock_quantity,
      item_record.reorder_point * 2
    );
    
    -- Create alert
    INSERT INTO low_stock_alerts (
      product_variant_id,
      product_name,
      variant_details,
      current_stock,
      reorder_point,
      suggested_reorder_quantity,
      priority
    ) VALUES (
      item_record.variant_id,
      item_record.product_name,
      item_record.variant_details,
      item_record.stock_quantity,
      item_record.reorder_point,
      suggested_quantity,
      alert_priority
    );
    
    alert_count := alert_count + 1;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock with movement tracking
CREATE OR REPLACE FUNCTION update_stock_with_tracking(
  variant_id UUID,
  new_quantity INTEGER,
  movement_type VARCHAR(20),
  reference_id VARCHAR(255) DEFAULT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_quantity INTEGER;
  quantity_change INTEGER;
BEGIN
  -- Get current stock quantity
  SELECT stock_quantity INTO current_quantity
  FROM product_variants
  WHERE id = variant_id;
  
  IF current_quantity IS NULL THEN
    RAISE EXCEPTION 'Product variant not found: %', variant_id;
  END IF;
  
  -- Calculate change
  quantity_change := new_quantity - current_quantity;
  
  -- Update stock quantity
  UPDATE product_variants
  SET 
    stock_quantity = new_quantity,
    updated_at = NOW(),
    last_restocked_at = CASE WHEN movement_type = 'restock' THEN NOW() ELSE last_restocked_at END
  WHERE id = variant_id;
  
  -- Record movement
  INSERT INTO inventory_movements (
    product_variant_id,
    movement_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    reference_id,
    reason,
    notes,
    created_by
  ) VALUES (
    variant_id,
    movement_type,
    quantity_change,
    current_quantity,
    new_quantity,
    reference_id,
    reason,
    notes,
    user_id
  );
  
  -- Check if low stock alert is needed
  PERFORM check_and_create_low_stock_alerts();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- Row Level Security (RLS) Policies
-- ==============================================

-- Enable RLS on inventory tables
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Policies for service role (full access)
CREATE POLICY "Service role can manage inventory movements" ON inventory_movements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage low stock alerts" ON low_stock_alerts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage stock reservations" ON stock_reservations
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for admin users
CREATE POLICY "Admin users can view inventory movements" ON inventory_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can manage low stock alerts" ON low_stock_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ==============================================
-- Triggers and Automation
-- ==============================================

-- Trigger to automatically create stock movements when stock changes
CREATE OR REPLACE FUNCTION trigger_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if stock quantity changed
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO inventory_movements (
      product_variant_id,
      movement_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'Direct stock update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'stock_movement_trigger'
  ) THEN
    CREATE TRIGGER stock_movement_trigger
      AFTER UPDATE ON product_variants
      FOR EACH ROW
      EXECUTE FUNCTION trigger_stock_movement();
  END IF;
END $$;

-- ==============================================
-- Sample Data and Initial Setup
-- ==============================================

-- Set initial reorder points for existing products (if they don't have them)
UPDATE product_variants 
SET 
  reorder_point = CASE 
    WHEN stock_quantity > 50 THEN 20
    WHEN stock_quantity > 20 THEN 10
    ELSE 5
  END,
  max_stock_level = CASE
    WHEN stock_quantity > 50 THEN 200
    WHEN stock_quantity > 20 THEN 100
    ELSE 50
  END
WHERE reorder_point IS NULL OR reorder_point = 10; -- Default value

-- ==============================================
-- Scheduled Jobs Setup (requires pg_cron extension)
-- ==============================================

-- Clean up expired reservations every hour
-- SELECT cron.schedule('cleanup-reservations', '0 */1 * * *', 'SELECT cleanup_expired_reservations();');

-- Check for low stock alerts every 6 hours
-- SELECT cron.schedule('check-low-stock', '0 */6 * * *', 'SELECT check_and_create_low_stock_alerts();');

-- ==============================================
-- Indexes for Performance
-- ==============================================

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_stock_level ON product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_reorder_point ON product_variants(reorder_point);
CREATE INDEX IF NOT EXISTS idx_product_variants_updated_at ON product_variants(updated_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_type_date ON inventory_movements(product_variant_id, movement_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_priority_created ON low_stock_alerts(priority, created_at DESC) WHERE acknowledged_at IS NULL;