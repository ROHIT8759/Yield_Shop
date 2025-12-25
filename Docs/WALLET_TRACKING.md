# Wallet Connection Tracking Setup

This feature automatically tracks wallet connections and stores user data in Supabase.

## Database Setup

### 1. Run the SQL Migration in Supabase

Go to your Supabase Dashboard → SQL Editor and run the following:

```sql
-- Create wallet_connections table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON public.wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_last_connected ON public.wallet_connections(last_connected_at DESC);

-- Enable RLS
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.wallet_connections
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.wallet_connections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.wallet_connections
    FOR UPDATE USING (true);
```

## Features Tracked

### Automatically Captured Data:

- ✅ **Wallet Address** - User's connected wallet
- ✅ **IP Address** - User's IP (via ipapi.co)
- ✅ **Country** - User's country
- ✅ **City** - User's city
- ✅ **Region/State** - User's region
- ✅ **Timezone** - User's timezone
- ✅ **User Agent** - Browser and device info
- ✅ **Connection Count** - Number of times connected
- ✅ **First Connected** - First connection timestamp
- ✅ **Last Connected** - Latest connection timestamp

### Note on MAC Address

**MAC addresses cannot be obtained from web browsers** due to security and privacy restrictions. Only IP address and location data are available in web applications.

## How It Works

1. **WalletTracker Component** runs in the background (added to layout.tsx)
2. When a wallet connects, it automatically:
   - Fetches IP and location data from ipapi.co API
   - Gets browser information
   - Saves/updates the record in Supabase
3. Data is stored with connection statistics

## API Used

- **IP Geolocation**: https://ipapi.co/json/ (Free tier: 1,000 requests/day)
- Alternative free APIs if needed:
  - ip-api.com
  - ipwhois.io
  - freegeoip.app

## View Your Data

Query your Supabase database:

```sql
SELECT * FROM wallet_connections ORDER BY last_connected_at DESC;
```

## Privacy Notice

This tracking is transparent and stores only:

- Publicly available blockchain addresses
- IP-based approximate location (no GPS)
- Browser metadata
- No personal identifying information

Users can view connection logs in their Supabase dashboard.
