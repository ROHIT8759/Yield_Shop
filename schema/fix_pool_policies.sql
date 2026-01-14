-- Fix Row Level Security Policies for Liquidity Pool
-- Run this in Supabase SQL Editor to fix the write permission errors

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read access to pool balance" ON liquidity_pool_balance;
DROP POLICY IF EXISTS "Allow public read access to pool transactions" ON pool_transactions;

-- Recreate policies with write permissions
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

CREATE POLICY "Allow public read access to pool transactions" ON pool_transactions
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to pool transactions" ON pool_transactions
    FOR INSERT
    WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('liquidity_pool_balance', 'pool_transactions')
ORDER BY tablename, policyname;
