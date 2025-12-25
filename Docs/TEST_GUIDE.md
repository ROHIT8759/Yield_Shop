# YieldShop Testing Guide

Complete test suite for smart contracts, database, and integration testing.

## 📋 Test Structure

```
test/
├── YieldShop.test.ts       # Smart contract unit tests
├── database.test.ts        # Database schema tests
└── integration.test.ts     # End-to-end integration tests
```

## 🚀 Running Tests

### 1. Contract Tests (Hardhat)

Test all smart contracts on a local blockchain fork.

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers

# Run all contract tests
npx hardhat test

# Run specific test file
npx hardhat test test/YieldShop.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### 2. Database Tests (Jest)

Test Supabase database schema, queries, and constraints.

```bash
# Install test dependencies
npm install --save-dev jest @jest/globals @types/jest ts-jest

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run database tests
npm run test:database

# Run with watch mode
npm run test:watch
```

### 3. Integration Tests

Test full workflow: wallet connection → contract interaction → database sync.

```bash
# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

## 📊 Test Coverage

### Contract Tests Cover:

✅ **YieldShop Contract**

- Affiliate purchase recording
- Gift card purchasing with crypto
- Cashback claiming after return period
- Yield accrual and distribution
- SHOP token rewards
- Coupon marketplace listing/buying
- Platform fee collection

✅ **ShopToken Contract**

- Token minting restrictions
- Max supply enforcement
- Burning functionality
- Name and symbol verification

✅ **LendingSystem Contract**

- Loan creation with collateral
- Collateralization ratio validation
- Loan repayment with interest
- Collateral liquidation
- On-chain reputation system
- Interest rate calculation

✅ **FlashLoanProvider Contract**

- Flash loan execution
- Fee calculation (0.09%)
- Liquidity management
- Repayment verification

### Database Tests Cover:

✅ **wallet_connections table**

- Insert wallet connections
- Retrieve by wallet address
- Update connection count
- Index performance

✅ **loan_transactions table**

- Insert loan records
- Query by wallet address
- Update loan status
- Filter by status

✅ **user_reputation table**

- Insert/update reputation
- Calculate repayment rate
- Level progression
- Unique wallet constraint

✅ **active_loans_summary view**

- Query active loans
- Column verification
- Security invoker flag

✅ **Performance & Constraints**

- Query performance (<1s)
- Pagination
- Bulk inserts
- Foreign key relationships
- Data validation

### Integration Tests Cover:

✅ **Wallet Connection Flow**

- Track wallet in database
- Increment connection count
- Geolocation data

✅ **Purchase Flow**

- Contract event to database sync
- Transaction hash tracking
- Status updates

✅ **Loan Flow**

- Create loan (contract + DB)
- Update reputation
- Repayment workflow
- Level calculation

✅ **User Stats**

- Aggregate statistics
- Total earnings calculation
- Data consistency

✅ **Error Handling**

- Invalid addresses
- Missing required fields
- Concurrent updates

## 🧪 Test Examples

### Testing Affiliate Purchase

```typescript
it("Should record affiliate purchase correctly", async function () {
  const amount = ethers.parseEther("100");
  const retailer = "Amazon";

  await expect(
    yieldShop.recordAffiliatePurchase(buyer.address, retailer, amount)
  )
    .to.emit(yieldShop, "PurchaseRecorded")
    .withArgs(0, buyer.address, retailer, amount, ethers.parseEther("1"), 0);

  const purchase = await yieldShop.getPurchase(0);
  expect(purchase.cashbackAmount).to.equal(ethers.parseEther("1")); // 1%
});
```

### Testing Database Insert

```typescript
it("should insert wallet connection", async () => {
  const { data, error } = await supabase
    .from("wallet_connections")
    .insert({
      wallet_address: testWalletAddress,
      ip_address: "192.168.1.1",
      country: "United States",
      connection_count: 1,
    })
    .select()
    .single();

  expect(error).toBeNull();
  expect(data?.wallet_address).toBe(testWalletAddress);
});
```

### Testing Integration Flow

```typescript
it("should create loan and update reputation", async () => {
  // 1. Create loan in database
  const { data: loan } = await supabase
    .from("loan_transactions")
    .insert({
      /* loan data */
    })
    .single();

  // 2. Update reputation
  const { data: rep } = await supabase
    .from("user_reputation")
    .update({ total_loans: 1 })
    .eq("wallet_address", testWallet)
    .single();

  // 3. Verify consistency
  expect(loan.status).toBe("active");
  expect(rep.total_loans).toBe(1);
});
```

## 📈 Coverage Requirements

- **Contracts**: 80%+ coverage
- **Database**: 90%+ coverage
- **Integration**: 70%+ coverage

Check coverage with:

```bash
npx hardhat coverage  # Contract coverage
npm run coverage      # Database/Integration coverage
```

## 🔧 Setup Environment

Create `.env.test` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key

# Contracts (for integration tests)
NEXT_PUBLIC_YIELDSHOP_CONTRACT=0x...
NEXT_PUBLIC_SHOPTOKEN_CONTRACT=0x...

# Private key for contract deployment (testnet only!)
PRIVATE_KEY=your_test_private_key
```

## 🐛 Debugging Tests

### Contract Tests

```bash
# Verbose output
npx hardhat test --verbose

# Show stack traces
npx hardhat test --stack-traces

# Run specific test
npx hardhat test --grep "Should record affiliate purchase"
```

### Database Tests

```bash
# Show console logs
npm test -- --verbose

# Run specific test file
npm test database.test.ts

# Update snapshots
npm test -- -u
```

## 📝 Writing New Tests

### Contract Test Template

```typescript
describe("Feature Name", function () {
  beforeEach(async function () {
    // Setup test data
  });

  it("Should do something", async function () {
    // Arrange
    const input = "test data";

    // Act
    const result = await contract.someFunction(input);

    // Assert
    expect(result).to.equal(expectedValue);
  });
});
```

### Database Test Template

```typescript
describe("Table Name", () => {
  it("should perform operation", async () => {
    const { data, error } = await supabase.from("table_name").select("*");

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## ✅ Pre-Deployment Checklist

Before deploying to Mantle Testnet/Mainnet:

- [ ] All contract tests passing (100%)
- [ ] Database tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] Gas optimization verified
- [ ] Security audit completed
- [ ] Frontend integration tested
- [ ] Wallet connection tracked
- [ ] User stats displaying correctly
- [ ] Error handling verified
- [ ] Performance benchmarks met

## 🆘 Common Issues

### Issue: "Cannot find module 'hardhat'"

```bash
npm install --save-dev hardhat
```

### Issue: "Supabase connection failed"

Check your `.env` file has correct credentials:

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Issue: "Test timeout"

Increase timeout in test:

```typescript
it("slow test", async function () {
  this.timeout(10000); // 10 seconds
});
```

## 📚 Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supabase Testing](https://supabase.com/docs/guides/api/testing)
- [Ethers.js Testing](https://docs.ethers.org/v6/api/providers/)

## 🎯 Next Steps

1. Run all tests: `npm run test:all`
2. Check coverage: `npm run coverage`
3. Fix any failing tests
4. Deploy contracts: `npx hardhat run scripts/deploy.ts --network mantleTestnet`
5. Update contract addresses in `.env`
6. Run integration tests again
7. Deploy to production! 🚀
