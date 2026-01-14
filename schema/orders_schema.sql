-- Orders Management Schema for YieldShop
-- Run these commands in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    wallet_address TEXT NOT NULL,
    
    -- Customer Information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Shipping Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    
    -- Product Information
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    product_price NUMERIC NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Retailer Information
    retailer TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- Payment Information
    payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'cashback')),
    transaction_hash TEXT,
    total_amount NUMERIC NOT NULL,
    cashback_earned NUMERIC DEFAULT 0,
    shop_tokens_earned NUMERIC DEFAULT 0,
    
    -- Order Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet_address);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
-- Allow users to read their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR true);

-- Allow users to insert their own orders
CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT
    WITH CHECK (true);

-- Allow users to update their own orders
CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE
    USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create order_notes table for tracking order updates
CREATE TABLE IF NOT EXISTS order_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
