-- Liquidity Pool Balance Management Schema
-- Run these commands in your Supabase SQL Editor

-- Create liquidity_pool_balance table
CREATE TABLE IF NOT EXISTS liquidity_pool_balance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_name TEXT DEFAULT 'shopping_pool' UNIQUE NOT NULL,
    total_balance NUMERIC DEFAULT 10000.00 NOT NULL,
    available_balance NUMERIC DEFAULT 10000.00 NOT NULL,
    reserved_balance NUMERIC DEFAULT 0.00 NOT NULL,
    total_orders_processed INTEGER DEFAULT 0,
    total_volume_processed NUMERIC DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pool_transactions table for tracking all balance changes
CREATE TABLE IF NOT EXISTS pool_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_name TEXT DEFAULT 'shopping_pool' NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('order', 'refund', 'deposit', 'withdrawal', 'fee_collection')),
    amount NUMERIC NOT NULL,
    balance_before NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    order_id TEXT,
    wallet_address TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pool_transactions_pool ON pool_transactions(pool_name);
CREATE INDEX IF NOT EXISTS idx_pool_transactions_type ON pool_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_pool_transactions_order ON pool_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pool_transactions_wallet ON pool_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_pool_transactions_created ON pool_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE liquidity_pool_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for liquidity_pool_balance
CREATE POLICY "Allow public read access to pool balance" ON liquidity_pool_balance
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public update to pool balance" ON liquidity_pool_balance
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public insert to pool balance" ON liquidity_pool_balance
    FOR INSERT
    WITH CHECK (true);

-- Create policies for pool_transactions
CREATE POLICY "Allow public read access to pool transactions" ON pool_transactions
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to pool transactions" ON pool_transactions
    FOR INSERT
    WITH CHECK (true);

-- Insert initial pool balance ($10,000)
INSERT INTO liquidity_pool_balance (pool_name, total_balance, available_balance, reserved_balance)
VALUES ('shopping_pool', 10000.00, 10000.00, 0.00)
ON CONFLICT (pool_name) DO NOTHING;

-- Function to update pool balance timestamp
CREATE OR REPLACE FUNCTION update_pool_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for pool balance updates
CREATE TRIGGER update_pool_balance_timestamp_trigger 
BEFORE UPDATE ON liquidity_pool_balance
FOR EACH ROW 
EXECUTE FUNCTION update_pool_balance_timestamp();

-- Function to log pool transactions
CREATE OR REPLACE FUNCTION log_pool_transaction(
    p_transaction_type TEXT,
    p_amount NUMERIC,
    p_balance_before NUMERIC,
    p_balance_after NUMERIC,
    p_order_id TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
BEGIN
    INSERT INTO pool_transactions (
        transaction_type,
        amount,
        balance_before,
        balance_after,
        order_id,
        wallet_address,
        description
    ) VALUES (
        p_transaction_type,
        p_amount,
        p_balance_before,
        p_balance_after,
        p_order_id,
        p_wallet_address,
        p_description
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;
