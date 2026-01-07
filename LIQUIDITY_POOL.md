# Liquidity Pool Implementation

## Overview
The Liquidity Pool system allows users to provide liquidity (MNT and USDC tokens) and earn fees from shopping transactions on the YieldShop platform.

## Smart Contract Features

### LiquidityPool Contract
Located in `contract/AllContracts.sol`

**Key Functions:**
- `addLiquidity(uint256 mntAmount, uint256 usdcAmount)` - Add liquidity to earn fees
- `removeLiquidity(uint256 lpTokenAmount)` - Withdraw your liquidity
- `processShoppingPayment(address buyer, uint256 amount, address paymentToken)` - Process payments through the pool
- `claimRewards()` - Claim earned fees
- `getPoolStats()` - View total liquidity and fees
- `getUserLiquidity(address user)` - View user's position

**Features:**
- 0.3% fee on all shopping transactions
- Proportional fee distribution to liquidity providers
- LP tokens representing pool shares
- No impermanent loss (fees only)

## Deployment

### 1. Deploy the Contract

```bash
npx hardhat run scripts/deploy-liquidity-pool.js --network mantleTestnet
```

This will:
- Deploy the LiquidityPool contract
- Update the `.env` file with the contract address
- Authorize YieldShop as a spender (if address is set)

### 2. Update Contract Addresses

After deployment, update these files:

**config/contracts.ts:**
```typescript
export const CONTRACTS = {
  // ... other contracts
  LIQUIDITY_POOL: '0xYourDeployedAddress' as `0x${string}`,
};
```

### 3. Connect YieldShop to Pool

Call `setLiquidityPool()` on the YieldShop contract:

```javascript
const yieldShop = await ethers.getContractAt("YieldShop", YIELDSHOP_ADDRESS);
await yieldShop.setLiquidityPool(LIQUIDITY_POOL_ADDRESS);
```

## Usage

### For Liquidity Providers

1. **Navigate to `/liquidity` page**
2. **Connect your wallet**
3. **Add Liquidity:**
   - Enter MNT amount
   - Enter USDC amount
   - Click "Add Liquidity"
   - Approve both tokens
   - Confirm transaction
   - Receive LP tokens

4. **Earn Fees:**
   - Fees are collected automatically from every shopping transaction
   - Your share = (Your LP tokens / Total LP tokens) × Total fees

5. **Claim Rewards:**
   - View your earned rewards in "Your Liquidity Position"
   - Click "Claim Rewards" to receive USDC fees

6. **Remove Liquidity:**
   - Switch to "Remove Liquidity" tab
   - Enter LP token amount
   - Get back your MNT and USDC proportionally

### For Shoppers

When you purchase gift cards on the `/shop` page:
- Your payment is processed through the liquidity pool
- 0.3% fee is deducted and distributed to liquidity providers
- You receive your gift card as usual

## Integration with YieldShop

The `purchaseGiftCard` function in YieldShop now:

1. Transfers payment from buyer to YieldShop
2. Approves the liquidity pool
3. Calls `processShoppingPayment()` on the pool
4. Pool deducts 0.3% fee
5. Pool returns net amount to buyer as a gift card
6. Fee accumulates for liquidity providers

## Benefits

**For Liquidity Providers:**
- ✓ Earn passive income from platform usage
- ✓ Proportional fee distribution
- ✓ Withdraw anytime
- ✓ No impermanent loss risk

**For the Platform:**
- ✓ Ensures liquidity for transactions
- ✓ Incentivizes ecosystem participation
- ✓ Creates sustainable revenue model
- ✓ Reduces need for external liquidity

## Technical Details

**Fee Structure:**
- Shopping fee: 0.3% (30 basis points)
- Distributed proportionally to LP holders
- Collected in USDC

**LP Token Calculation:**
```solidity
// Initial liquidity
lpTokens = sqrt(mntAmount * usdcAmount)

// Additional liquidity
lpTokens = min(
  (mntAmount * totalLPSupply) / totalMNTLiquidity,
  (usdcAmount * totalLPSupply) / totalUSDCLiquidity
)
```

**Security:**
- ReentrancyGuard on all state-changing functions
- Pausable in case of emergency
- Owner controls for authorized spenders
- Minimum liquidity requirement (1000 wei)

## Example Workflow

```typescript
// 1. User adds 100 MNT and 100 USDC
await liquidityPool.addLiquidity(
  parseEther("100"), // 100 MNT
  parseEther("100")  // 100 USDC
);
// Receives LP tokens

// 2. Shoppers make purchases worth $10,000
// Fees collected = $10,000 × 0.003 = $30

// 3. User claims rewards
await liquidityPool.claimRewards();
// Receives proportional share of $30 in USDC
```

## Testing

Run the contract tests:

```bash
npm run test:contracts
```

## Notes

- Ensure YieldShop has sufficient SHOP tokens to reward shoppers
- Initial liquidity should be balanced for accurate pricing
- Monitor pool health and fee collection regularly
- Consider adding additional tokens in future versions

## Frontend Access

Visit the Liquidity page at: `http://localhost:3000/liquidity`

## Support

For issues or questions:
- Check contract deployment logs
- Verify all addresses are correctly set
- Ensure tokens are approved before transactions
- Check Mantle testnet block explorer for transaction details
