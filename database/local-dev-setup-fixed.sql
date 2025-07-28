-- =============================================
-- Military Tees UK - Local Development Database Setup (FIXED)
-- =============================================
-- Run this script in your Supabase SQL Editor for local development
-- This creates the minimum required tables for basic functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING TABLES (if they exist with wrong schema)
-- =============================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS custom_quotes CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS set_order_number() CASCADE;

-- =============================================
-- CORE TABLES FOR LOCAL DEVELOPMENT
-- =============================================

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2),
    category_id UUID REFERENCES categories(id),
    main_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table (sizes, colors, etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Small - Black"
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    size VARCHAR(50),
    color VARCHAR(50),
    image_urls TEXT[], -- Array of image URLs for this variant
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (extends auth.users)
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'GBP',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    stripe_payment_intent_id VARCHAR(255),
    
    -- Shipping information
    shipping_name VARCHAR(255),
    shipping_address_line_1 VARCHAR(255),
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_postcode VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Billing information
    billing_name VARCHAR(255),
    billing_address_line_1 VARCHAR(255),
    billing_address_line_2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_postcode VARCHAR(20),
    billing_country VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Snapshot of product details at time of order
    product_name VARCHAR(255),
    variant_name VARCHAR(255),
    product_sku VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom quotes table
CREATE TABLE custom_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    order_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    design_images TEXT[], -- Array of uploaded image URLs
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'quoted', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    quoted_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(100) DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- SAMPLE DATA FOR LOCAL DEVELOPMENT
-- =============================================

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('T-Shirts', 't-shirts', 'Military-themed t-shirts and casual wear'),
('Hoodies', 'hoodies', 'Comfortable hoodies with military designs'),
('Accessories', 'accessories', 'Military-themed accessories and gear'),
('Special Forces', 'special-forces', 'Elite unit themed apparel');

-- Insert sample products
DO $$
DECLARE
    tshirt_cat_id UUID;
BEGIN
    -- Get the t-shirts category ID
    SELECT id INTO tshirt_cat_id FROM categories WHERE slug = 't-shirts';
    
    -- Insert products
    INSERT INTO products (name, slug, description, price, category_id, main_image_url, stock_quantity, sku) VALUES
    ('SAS Regiment Elite Tee', 'sas-regiment-elite-tee', 'Premium quality t-shirt honoring the elite SAS Regiment. Made from 100% cotton with a comfortable fit.', 24.99, tshirt_cat_id, '/products/sas-regiment-elite-tee.jpg', 50, 'SAS-TEE-001'),
    ('Royal Marine Commando Tee', 'royal-marine-commando-tee', 'Honor the Royal Marines with this premium commando-themed t-shirt.', 24.99, tshirt_cat_id, '/products/royal-marine-commando-tee.jpg', 45, 'RMC-TEE-001'),
    ('Paratrooper Wings Design', 'paratrooper-wings-design', 'Classic paratrooper wings design on premium cotton t-shirt.', 22.99, tshirt_cat_id, '/products/paratrooper-wings-design.jpg', 60, 'PARA-TEE-001');
END $$;

-- Insert sample product variants
DO $$
DECLARE
    product_rec RECORD;
BEGIN
    FOR product_rec IN SELECT id, sku FROM products WHERE sku IN ('SAS-TEE-001', 'RMC-TEE-001', 'PARA-TEE-001')
    LOOP
        -- Insert variants for each product
        INSERT INTO product_variants (product_id, name, sku, size, color, stock_quantity, price) VALUES
        (product_rec.id, 'Small - Black', product_rec.sku || '-S-BLK', 'S', 'Black', 8, NULL),
        (product_rec.id, 'Medium - Black', product_rec.sku || '-M-BLK', 'M', 'Black', 15, NULL),
        (product_rec.id, 'Large - Black', product_rec.sku || '-L-BLK', 'L', 'Black', 12, NULL),
        (product_rec.id, 'XL - Black', product_rec.sku || '-XL-BLK', 'XL', 'Black', 8, NULL),
        (product_rec.id, 'Small - Navy', product_rec.sku || '-S-NAV', 'S', 'Navy', 5, NULL),
        (product_rec.id, 'Medium - Navy', product_rec.sku || '-M-NAV', 'M', 'Navy', 10, NULL),
        (product_rec.id, 'Large - Navy', product_rec.sku || '-L-NAV', 'L', 'Navy', 8, NULL);
    END LOOP;
END $$;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY customers_own_data ON customers
    FOR ALL USING (auth.uid() = id);

-- Customers can only see their own orders
CREATE POLICY customers_own_orders ON orders
    FOR ALL USING (auth.uid() = customer_id);

-- Customers can only see their own order items
CREATE POLICY customers_own_order_items ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

-- Customers can only see their own quotes
CREATE POLICY customers_own_quotes ON custom_quotes
    FOR ALL USING (auth.uid() = customer_id);

-- Public read access for products and categories
CREATE POLICY products_public_read ON products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY product_variants_public_read ON product_variants
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY categories_public_read ON categories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY product_images_public_read ON product_images
    FOR SELECT USING (TRUE);

-- Newsletter can be inserted by anyone
CREATE POLICY newsletter_public_insert ON newsletter_subscribers
    FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set order number
CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_quotes_updated_at BEFORE UPDATE ON custom_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🛡️ Military Tees UK - Database Setup Complete!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Tables created: ✅';
    RAISE NOTICE 'Sample data added: ✅';
    RAISE NOTICE '  - 4 categories';
    RAISE NOTICE '  - 3 products with variants';
    RAISE NOTICE '  - 21 product variants total';
    RAISE NOTICE 'Security policies: ✅';
    RAISE NOTICE 'Ready for localhost:3000 🚀';
    RAISE NOTICE '================================================';
END $$;