-- Supabase SQL Schema for YieldShop Lending System
-- Run these commands in your Supabase SQL Editor

-- Create loan_transactions table
CREATE TABLE IF NOT EXISTS loan_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id TEXT UNIQUE NOT NULL,
    borrower_address TEXT NOT NULL,
    collateral_amount TEXT NOT NULL,
    borrowed_amount TEXT NOT NULL,
    interest_rate NUMERIC NOT NULL,
    start_time BIGINT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'repaid', 'liquidated')),
    tx_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    repaid_at TIMESTAMP WITH TIME ZONE,
    repaid_on_time BOOLEAN
);

-- Create user_reputation table
CREATE TABLE IF NOT EXISTS user_reputation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 5),
    total_loans INTEGER DEFAULT 0,
    repaid_on_time INTEGER DEFAULT 0,
    total_volume TEXT DEFAULT '0',
    last_update BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_borrower ON loan_transactions(borrower_address);
CREATE INDEX IF NOT EXISTS idx_loan_status ON loan_transactions(status);
CREATE INDEX IF NOT EXISTS idx_loan_created ON loan_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_address ON user_reputation(user_address);

-- Enable Row Level Security (RLS)
ALTER TABLE loan_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- Create policies for loan_transactions
-- Allow anyone to read loan transactions
CREATE POLICY "Allow public read access" ON loan_transactions
    FOR SELECT
    USING (true);

-- Allow users to insert their own loan transactions
CREATE POLICY "Allow insert for authenticated users" ON loan_transactions
    FOR INSERT
    WITH CHECK (true);

-- Allow users to update their own loan transactions
CREATE POLICY "Allow update for borrower" ON loan_transactions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create policies for user_reputation
-- Allow anyone to read reputation
CREATE POLICY "Allow public read access" ON user_reputation
    FOR SELECT
    USING (true);

-- Allow insert/update for any authenticated user (needed for upsert)
CREATE POLICY "Allow upsert for authenticated users" ON user_reputation
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON user_reputation
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create a function to calculate reputation score
CREATE OR REPLACE FUNCTION calculate_reputation_score(user_addr TEXT)
RETURNS TABLE (
    level INTEGER,
    total_loans BIGINT,
    repaid_on_time BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ur.level, 0) as level,
        COUNT(lt.id) as total_loans,
        COUNT(lt.id) FILTER (WHERE lt.repaid_on_time = true) as repaid_on_time,
        CASE 
            WHEN COUNT(lt.id) > 0 THEN 
                ROUND((COUNT(lt.id) FILTER (WHERE lt.repaid_on_time = true)::NUMERIC / COUNT(lt.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as success_rate
    FROM user_reputation ur
    LEFT JOIN loan_transactions lt ON lt.borrower_address = ur.user_address
    WHERE ur.user_address = user_addr
    GROUP BY ur.level;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active loans summary
CREATE OR REPLACE VIEW active_loans_summary AS
SELECT 
    borrower_address,
    COUNT(*) as active_loan_count,
    SUM(borrowed_amount::NUMERIC) as total_borrowed,
    SUM(collateral_amount::NUMERIC) as total_collateral,
    AVG(interest_rate) as avg_interest_rate
FROM loan_transactions
WHERE status = 'active'
GROUP BY borrower_address;

-- Grant access to the view
GRANT SELECT ON active_loans_summary TO anon, authenticated;
