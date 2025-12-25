# Lending System - Setup Guide

## Overview
A fully functional collateral-based lending system with on-chain reputation tracking and Supabase integration for transaction history.

## Features

### Smart Contract Features
- **Collateral-Based Loans**: 150% minimum collateralization ratio
- **Dynamic Interest Rates**: 5% base APR with up to 2% discount per reputation level
- **On-Chain Reputation**: 5-level system (New → Bronze → Silver → Gold → Platinum → Diamond)
- **Automatic Liquidation**: Collateral seized if loan not repaid by due date
- **Multi-Token Support**: Borrow and collateralize with MNT, USDC

### Frontend Features
- **Live Reputation Dashboard**: Real-time reputation display with star rating
- **Loan Creation**: Simple interface with collateral ratio calculator
- **Loan Management**: Track active loans, due dates, and interest
- **Transaction History**: All loans stored in Supabase with full history
- **Interest Rate Preview**: See your current rate based on reputation

### Supabase Integration
- **Transaction Storage**: Every loan stored with full details
- **Reputation Tracking**: Historical reputation data and updates
- **Performance Analytics**: Calculate success rates and volumes
- **Query Optimization**: Indexed tables for fast data retrieval

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait for project to be provisioned (~2 minutes)

#### Run SQL Schema
1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase_schema.sql`
3. Paste and click "Run"
4. This creates:
   - `loan_transactions` table
   - `user_reputation` table
   - Indexes for performance
   - Row Level Security policies
   - Helper functions and views

#### Get API Credentials
1. Go to Project Settings → API
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon public** key (long JWT token)

### 3. Configure Environment Variables

Create `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Deploy Smart Contract

#### Update Contract
The `LendingSystem` contract is already added to `contract/yield_shop.sol` (lines 595+)

#### Deploy to Mantle Testnet
```bash
# Compile contracts
npx hardhat compile

# Deploy LendingSystem
npx hardhat run scripts/deploy_lending.js --network mantleTestnet
```

#### Update Contract Address
After deployment, update `/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  LENDING: '0xYourDeployedLendingContractAddress' as `0x${string}`,
  // ... other contracts
};
```

### 5. Test the System

#### On Mantle Testnet
1. Get testnet MNT from [Mantle Faucet](https://faucet.testnet.mantle.xyz/)
2. Connect wallet to app
3. Go to "Loan System" page
4. Create a test loan:
   - Collateral: 1.5 MNT
   - Borrow: 1.0 USDC
   - Duration: 30 days
5. Check Supabase to see transaction stored

## How It Works

### Reputation System

#### Levels (0-5)
- **Level 0 (New)**: 5% interest rate
- **Level 1 (Bronze)**: 4.5% interest (1+ loans, 50%+ success)
- **Level 2 (Silver)**: 4% interest (3+ loans, 70%+ success)
- **Level 3 (Gold)**: 3.5% interest (5+ loans, 80%+ success)
- **Level 4 (Platinum)**: 3% interest (8+ loans, 90%+ success)
- **Level 5 (Diamond)**: 2.5% interest (10+ loans, 95%+ success)

#### Reputation Updates
- **On-Time Repayment**: +1 to repaid_on_time counter, recalculate level
- **Late/Default**: -1 level (if level > 0)
- **Automatic**: Updates happen on-chain during repayment/liquidation

### Transaction Flow

#### Creating a Loan
1. **Frontend**: User fills form (collateral, borrow amount, duration)
2. **Validation**: Check 150% collateral ratio
3. **Smart Contract**: 
   - Transfer collateral from user
   - Calculate interest rate based on reputation
   - Create loan record
   - Transfer borrowed tokens to user
   - Update reputation stats
4. **Supabase**: Save transaction with all details + tx hash

#### Repaying a Loan
1. **Frontend**: User clicks "Repay Loan" on active loan
2. **Smart Contract**:
   - Calculate interest owed
   - Transfer repayment (principal + interest) from user
   - Return collateral to user
   - Check if repaid on time
   - Update reputation (increase if on time)
3. **Supabase**: Update loan status, repaid_at timestamp, repaid_on_time flag

#### Liquidation
1. **Trigger**: Any user can call `liquidateLoan()` after due date
2. **Smart Contract**:
   - Transfer collateral to platform owner
   - Mark loan as inactive
   - Decrease borrower's reputation
3. **Supabase**: Update loan status to 'liquidated'

## Database Schema

### loan_transactions
```sql
- id (UUID, primary key)
- loan_id (TEXT, unique) - Transaction hash or on-chain ID
- borrower_address (TEXT) - User wallet address
- collateral_amount (TEXT) - Amount in string format
- borrowed_amount (TEXT) - Amount in string format
- interest_rate (NUMERIC) - APR percentage
- start_time (BIGINT) - Unix timestamp
- duration (INTEGER) - Loan duration in seconds
- status (TEXT) - 'active', 'repaid', or 'liquidated'
- tx_hash (TEXT) - Transaction hash
- repaid_at (TIMESTAMP) - When loan was repaid
- repaid_on_time (BOOLEAN) - Whether repaid before due date
```

### user_reputation
```sql
- id (UUID, primary key)
- user_address (TEXT, unique) - User wallet address
- level (INTEGER) - Reputation level (0-5)
- total_loans (INTEGER) - Total number of loans
- repaid_on_time (INTEGER) - Number of on-time repayments
- total_volume (TEXT) - Total borrowed volume
- last_update (BIGINT) - Last reputation update timestamp
```

## API Functions

### Supabase Client (`lib/supabase.ts`)

#### saveLoanTransaction(transaction)
Saves a new loan transaction to database
```typescript
await saveLoanTransaction({
  loan_id: '0x123...',
  borrower_address: '0xabc...',
  collateral_amount: '1.5',
  borrowed_amount: '1.0',
  interest_rate: 5,
  start_time: 1640000000,
  duration: 2592000,
  status: 'active',
  tx_hash: '0x123...'
});
```

#### updateLoanTransaction(loanId, updates)
Updates an existing loan
```typescript
await updateLoanTransaction('0x123...', {
  status: 'repaid',
  repaid_at: new Date().toISOString(),
  repaid_on_time: true
});
```

#### getUserLoans(userAddress)
Gets all loans for a user
```typescript
const loans = await getUserLoans('0xabc...');
```

#### saveReputationData(reputation)
Saves/updates user reputation (upsert)
```typescript
await saveReputationData({
  user_address: '0xabc...',
  level: 3,
  total_loans: 5,
  repaid_on_time: 4,
  total_volume: '10.5',
  last_update: 1640000000
});
```

#### getUserReputation(userAddress)
Gets user reputation data
```typescript
const rep = await getUserReputation('0xabc...');
```

## Smart Contract Functions

### createLoan(collateralAmount, borrowAmount, duration, collateralToken, borrowToken)
Creates a new collateralized loan
- Requires 150% collateralization
- Calculates interest based on reputation
- Emits `LoanCreated` event

### repayLoan(loanId)
Repays an active loan
- Calculates and charges interest
- Returns collateral
- Updates reputation
- Emits `LoanRepaid` event

### liquidateLoan(loanId)
Liquidates an overdue loan
- Only callable after due date
- Transfers collateral to platform
- Decreases borrower reputation
- Emits `CollateralLiquidated` event

### userReputation(user)
Returns user's reputation data
- level, totalLoans, repaidOnTime, totalVolume, lastUpdate

### calculateInterestRate(user)
Returns current interest rate for user (in basis points)
- 500 = 5%, 450 = 4.5%, etc.

### calculateInterest(loanId)
Calculates accrued interest for a loan

### getUserLoans(user)
Returns array of loan IDs for user

## Security Features

### Smart Contract
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Owner can pause in emergencies
- **Ownable**: Only owner can liquidate or pause
- **Overflow Protection**: Solidity 0.8+ built-in

### Supabase
- **Row Level Security (RLS)**: Enabled on all tables
- **Public Read**: Anyone can read loan/reputation data
- **Authenticated Write**: Only authenticated users can insert/update
- **Policies**: Separate policies for SELECT, INSERT, UPDATE

## Monitoring & Analytics

### Supabase Dashboard
- Go to Table Editor to see all transactions
- Use SQL Editor to run custom queries
- Check Database → Performance for query optimization

### Example Queries

#### Top Borrowers by Volume
```sql
SELECT 
  borrower_address,
  COUNT(*) as loan_count,
  SUM(borrowed_amount::NUMERIC) as total_borrowed
FROM loan_transactions
GROUP BY borrower_address
ORDER BY total_borrowed DESC
LIMIT 10;
```

#### Reputation Leaderboard
```sql
SELECT 
  user_address,
  level,
  total_loans,
  repaid_on_time,
  ROUND((repaid_on_time::NUMERIC / total_loans::NUMERIC) * 100, 2) as success_rate
FROM user_reputation
WHERE total_loans > 0
ORDER BY level DESC, success_rate DESC
LIMIT 20;
```

#### Active Loans Summary
```sql
SELECT * FROM active_loans_summary
ORDER BY total_borrowed DESC;
```

## Troubleshooting

### "Supabase client not configured"
- Check `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL and KEY
- Restart dev server after adding env variables

### "PGRST116 error" (Not found)
- This is normal for first-time users with no data
- Error is caught and handled in `getUserReputation()`

### "Failed to save transaction"
- Check Supabase table exists (run schema SQL)
- Verify RLS policies are set up
- Check browser console for detailed error

### Contract not deployed
- Update `CONTRACTS.LENDING` address after deployment
- Ensure you're on correct network (Mantle Testnet)

## Production Checklist

- [ ] Deploy LendingSystem contract to Mantle Mainnet
- [ ] Update `CONTRACTS.LENDING` with mainnet address
- [ ] Set up Supabase production project
- [ ] Add Supabase credentials to production env
- [ ] Test loan creation on mainnet
- [ ] Test loan repayment
- [ ] Verify Supabase data sync
- [ ] Set up monitoring/alerts
- [ ] Add analytics dashboard
- [ ] Document liquidation process

## Support

For issues or questions:
1. Check contract events in block explorer
2. Check Supabase logs in dashboard
3. Review browser console for errors
4. Verify wallet is connected and on correct network
