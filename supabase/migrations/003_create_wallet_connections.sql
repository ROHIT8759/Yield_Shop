-- Create wallet_connections table
-- This table stores information about wallet connections including IP and location data

CREATE TABLE IF NOT EXISTS public.wallet_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    timezone TEXT,
    user_agent TEXT,
    first_connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_connected_at TIMESTAMPTZ DEFAULT NOW(),
    connection_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on wallet_address for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON public.wallet_connections(wallet_address);

-- Create index on last_connected_at for tracking recent connections
CREATE INDEX IF NOT EXISTS idx_wallet_connections_last_connected ON public.wallet_connections(last_connected_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read wallet connections
CREATE POLICY "Allow public read access" ON public.wallet_connections
    FOR SELECT USING (true);

-- Create policy to allow insert of new connections
CREATE POLICY "Allow public insert" ON public.wallet_connections
    FOR INSERT WITH CHECK (true);

-- Create policy to allow update of existing connections
CREATE POLICY "Allow public update" ON public.wallet_connections
    FOR UPDATE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_wallet_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER trigger_wallet_connections_updated_at
    BEFORE UPDATE ON public.wallet_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_connections_updated_at();

-- Add comment to table
COMMENT ON TABLE public.wallet_connections IS 'Stores wallet connection data including IP address, location, and connection statistics';
