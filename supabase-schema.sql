-- =======================================================
-- MINI DARAZ - SUPABASE DATABASE SCHEMA & SEED DATA
-- Copy and run this script in your Supabase SQL Editor
-- =======================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount_percent INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    images TEXT[], -- array of extra image URLs
    rating DECIMAL(3, 2) DEFAULT 4.5,
    reviews_count INT DEFAULT 12,
    stock INT DEFAULT 50,
    is_flash_sale BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    link TEXT,
    tag VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow Public Anonymous Access for Reading Products, Categories, Banners
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public read banners" ON banners FOR SELECT USING (true);

-- Allow Public Access for Creating Orders & Reading Orders
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON orders FOR DELETE USING (true);

-- =======================================================
-- INITIAL SEED DATA
-- =======================================================

INSERT INTO categories (name, slug, icon, image_url) VALUES
('Electronics', 'electronics', 'smartphone', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'),
('Fashion', 'fashion', 'shirt', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80'),
('Home & Living', 'home-living', 'home', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'),
('Beauty & Health', 'beauty-health', 'sparkles', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'),
('Groceries', 'groceries', 'shopping-bag', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'),
('Sports & Fitness', 'sports-fitness', 'activity', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (title, description, price, original_price, discount_percent, category, image_url, rating, reviews_count, stock, is_flash_sale, is_featured) VALUES
('Wireless Noise Cancelling Headphones TWS', 'High clarity audio with active noise cancellation, 30 hours battery life, Bluetooth 5.3, built-in microphone for handsfree calls.', 4599.00, 6999.00, 34, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 4.8, 142, 45, true, true),
('Smart Watch Pro Series 8 with AMOLED Display', 'Fitness tracker, heart rate monitor, sleep tracking, IP68 waterproof, 10-day battery standby.', 3299.00, 4999.00, 34, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 4.6, 98, 30, true, true),
('Men Casual Slim-Fit Denim Jacket', 'Premium breathable cotton denim, classic button-down front, dual chest pockets, perfect for all seasons.', 2499.00, 3999.00, 37, 'Fashion', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', 4.7, 76, 25, true, false),
('Luxury Mechanical Automatic Men Watch', 'Stainless steel mesh strap, skeleton dial display, 30m water resistant, luminous hands.', 5899.00, 8999.00, 34, 'Fashion', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80', 4.9, 210, 15, false, true),
('Ergonomic Mesh Office Chair with Lumbar Support', '360 degree swivel, adjustable height and headrest, breathable mesh back, heavy duty base.', 12499.00, 16999.00, 26, 'Home & Living', 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=600&q=80', 4.5, 64, 10, false, true),
('Portable Electric Espresso Coffee Maker', '15-bar pressure extraction, rechargeable battery, compatible with ground coffee & Nespresso pods.', 7999.00, 10999.00, 27, 'Home & Living', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80', 4.7, 52, 18, true, true),
('Hydrating Serum with Vitamin C & Hyaluronic Acid', 'Anti-aging facial serum, brightens dark spots, restores skin elasticity, 30ml dermatologist tested.', 1299.00, 1999.00, 35, 'Beauty & Health', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', 4.8, 320, 80, true, false),
('Organic Green Tea Selection Box (100 Bags)', 'Pure antioxidant rich green tea leaves, infused with lemon, mint & chamomile flavors.', 850.00, 1200.00, 29, 'Groceries', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80', 4.9, 180, 120, false, false),
('High-Density Non-Slip Yoga Mat (10mm)', 'Eco-friendly TPE material, carrying strap included, shock absorbent for home workouts.', 1899.00, 2600.00, 27, 'Sports & Fitness', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80', 4.6, 95, 40, false, true),
('4K Ultra HD Dash Cam Dual Camera', '170 degree wide angle, night vision, G-sensor loop recording, includes 32GB SD card.', 6499.00, 9499.00, 31, 'Electronics', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', 4.7, 43, 22, true, false);
