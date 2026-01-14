# Database Setup Guide

## Setup Instructions

Your Supabase credentials are already configured in `.env`. Now you need to create the database tables:

### Step 1: Access Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Login with: **killer.u.421@gmail.com**
3. Select your project: **spurkpbmzskcyymgjvvz**
4. Click on "SQL Editor" in the left sidebar

### Step 2: Run SQL Schema Files

Run these files **in order** by copying and pasting into the SQL Editor:

#### 1. Orders Schema (First)
```bash
File: schema/orders_schema.sql
```
- Creates `orders` table (stores customer orders)
- Creates `order_notes` table (stores order updates)
- Sets up Row Level Security policies

#### 2. Liquidity Pool Schema (Second)
```bash
File: schema/liquidity_pool_schema.sql
```
- Creates `liquidity_pool_balance` table (tracks pool balance - starts at $10,000)
- Creates `pool_transactions` table (logs all balance changes)
- Sets up automatic triggers and functions

#### 3. Wallet Connections Schema (Third)
```bash
File: supabase/migrations/003_create_wallet_connections.sql
```
- Creates `wallet_connections` table (tracks user wallet connections)

### Step 3: Verify Tables Created

In Supabase, click "Table Editor" and verify these tables exist:
- ✅ `orders`
- ✅ `order_notes`
- ✅ `liquidity_pool_balance` (should have 1 row with $10,000 balance)
- ✅ `pool_transactions`
- ✅ `wallet_connections`

### Step 4: Check Initial Pool Balance

In SQL Editor, run:
```sql
SELECT * FROM liquidity_pool_balance WHERE pool_name = 'shopping_pool';
```

You should see:
- `total_balance`: 10000.00
- `available_balance`: 10000.00
- `reserved_balance`: 0.00

### Troubleshooting

**Error: "Error updating pool balance: {}"**
- This means tables don't exist yet
- Run the SQL schema files above

**Error: "relation does not exist"**
- Table wasn't created
- Re-run the specific schema file

**Need to reset pool balance to $10,000:**
```sql
UPDATE liquidity_pool_balance 
SET available_balance = 10000.00, 
    total_balance = 10000.00,
    total_orders_processed = 0,
    total_volume_processed = 0
WHERE pool_name = 'shopping_pool';
```

## Testing

After setup, test by:
1. Go to `/shop` page
2. Connect wallet
3. Click "Buy Now" on any coupon
4. Fill out checkout form
5. Place order
6. Pool balance should decrease by order amount

## Current Configuration

- **Supabase URL**: https://spurkpbmzskcyymgjvvz.supabase.co
- **Initial Pool Balance**: $10,000
- **Pool Name**: shopping_pool
- **Order Deduction**: Automatic on order placement
