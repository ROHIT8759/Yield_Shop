# Coupon Marketplace Integration - Complete

## Overview

The coupon marketplace has been fully integrated with blockchain functionality, allowing users to:

- List coupons for sale on the blockchain
- Browse active coupon listings
- Purchase coupons with cryptocurrency (MNT/USDC)
- Earn 1% SHOP token rewards on coupon purchases

## Files Created/Modified

### 1. CouponCard Component (`/components/CouponCard.tsx`) ✅ NEW

A React component that displays individual coupon listings from the blockchain.

**Features:**

- Fetches live coupon data using `useReadContract` hook
- Displays retailer, face value, selling price, discount %, and expiry
- Shows seller address and verification badge
- Calculates days remaining until expiry
- Buy button with pending state handling
- Shows 1% SHOP token reward message

**Key Implementation:**

```tsx
const { data: couponData } = useReadContract({
  address: CONTRACTS.YIELDSHOP,
  abi: YIELDSHOP_ABI,
  functionName: "couponListings",
  args: [couponId],
});
```

### 2. Shop Page (`/app/shop/page.tsx`) ✅ UPDATED

Enhanced with blockchain integration for coupon marketplace.

**New Imports:**

- `CouponCard` component for displaying coupons

**State Variables for Sell Form:**

- `couponRetailer` - Selected retailer (Amazon/Flipkart/Target/Walmart)
- `couponFaceValue` - Coupon face value in MNT
- `couponSellingPrice` - Listing price in MNT
- `couponExpiry` - Expiry date
- `couponCode` - Coupon code (will be hashed)

**Blockchain Integration:**

```tsx
// Read active coupons from blockchain
const { data: activeCouponIds } = useReadContract({
  address: CONTRACTS.YIELDSHOP,
  functionName: "getActiveCoupons",
});

// Write contracts for listing and buying
const { writeContract: listCoupon, data: listHash } = useWriteContract();
const { writeContract: buyCoupon, data: buyHash } = useWriteContract();

// Transaction status tracking
const { isLoading: isListPending, isSuccess: isListSuccess } =
  useWaitForTransactionReceipt({ hash: listHash });
```

**Transaction Handlers:**

- `handleSellCoupon()` - Lists coupon on blockchain with validation
- `handleBuyCoupon(couponId)` - Purchases coupon with USDC payment

**UI Updates:**

- Sell modal form now bound to state variables
- Form validation (price < face value, expiry > today)
- Success/loading states for transactions
- Auto-refetch coupons after successful transactions
- Coupon grid displays blockchain data via CouponCard components

### 3. Smart Contract (`/contract/yield_shop.sol`) ✅ COMPLETE

Already updated with full coupon marketplace functionality:

- `CouponListing` struct with all fields
- `listCoupon()` - Seller lists coupon
- `buyCoupon()` - Buyer purchases with 2% platform fee
- `getActiveCoupons()` - Returns active listing IDs
- `getUserCouponListings()` - User's listings

### 4. Contract Config (`/config/contracts.ts`) ✅ COMPLETE

All necessary ABIs already added:

- `listCoupon` function ABI (5 parameters)
- `buyCoupon` function ABI (2 parameters)
- `couponListings` mapping ABI (9 return values)
- `getActiveCoupons` view function ABI

## How It Works

### Listing a Coupon

1. User clicks "Sell Your Coupon" button
2. Fills out form with retailer, face value, selling price, expiry, and code
3. Form validates that selling price < face value
4. Clicks "List Coupon" button
5. `handleSellCoupon()` is called:
   - Converts expiry date to Unix timestamp
   - Parses face value and selling price to Wei
   - Calls `listCoupon()` on smart contract
6. Transaction is sent to Mantle Network
7. On success, modal shows success message
8. Coupon appears in marketplace grid

### Buying a Coupon

1. User browses coupon marketplace grid
2. Each `CouponCard` component fetches its data from blockchain
3. User clicks "Buy Now" on desired coupon
4. `handleBuyCoupon(couponId)` is called:
   - Calls `buyCoupon()` with coupon ID and USDC address
5. Transaction is sent to Mantle Network
6. Smart contract processes payment:
   - 98% goes to seller
   - 2% goes to platform
   - 1% SHOP tokens minted to buyer
7. On success, coupons refetch automatically
8. Purchased coupon is removed from active listings

## Platform Economics

### Seller Benefits

- List coupons at any price below face value
- Receive 98% of selling price
- Instant payment upon sale
- No listing fees

### Buyer Benefits

- Purchase coupons at discounted prices
- Earn 1% SHOP token rewards
- Verified sellers with blockchain transparency
- See days remaining before expiry

### Platform Revenue

- 2% fee on all coupon sales
- Grows with marketplace volume

## Next Steps

### For Testing

1. **Deploy Contracts** to Mantle Testnet:

   ```bash
   # Compile contract
   npx hardhat compile

   # Deploy to Mantle Testnet
   npx hardhat run scripts/deploy.js --network mantleTestnet
   ```

2. **Update Contract Addresses** in `/config/contracts.ts`:

   ```typescript
   export const CONTRACTS = {
     YIELDSHOP: "0x...", // Deployed YieldShop address
     SHOP: "0x...", // Deployed ShopToken address
     MNT: "0x...", // Mantle token address
     USDC: "0x...", // USDC token address
   };
   ```

3. **Test on Testnet**:
   - Connect MetaMask to Mantle Testnet (Chain ID: 5003)
   - Get testnet MNT from faucet
   - List a test coupon
   - Purchase with another wallet
   - Verify 1% SHOP tokens received

### For Production

1. Deploy to Mantle Mainnet (Chain ID: 5000)
2. Update contract addresses
3. Add coupon code reveal mechanism (after purchase)
4. Implement dispute resolution
5. Add seller reputation system
6. Mobile responsive improvements

## Technical Achievements

✅ Full blockchain integration (reads & writes)
✅ Real-time coupon data fetching
✅ Transaction state management (pending, success, error)
✅ Form validation and UX
✅ Auto-refetch after transactions
✅ Loading states and success messages
✅ Discount calculation and days remaining
✅ Clean component architecture

## Code Quality

- TypeScript for type safety
- Wagmi hooks for Web3 interactions
- Proper error handling
- Loading/pending states
- Form validation
- Responsive design
- Clean component separation
