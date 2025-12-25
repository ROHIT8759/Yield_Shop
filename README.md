<div align="center">
  <img src="/public/logo.svg" alt="YieldShop Logo" width="150">
  <h1>YieldShop</h1>
  <p>Shop, earn rewards, and generate DeFi yield - all on Mantle Network</p>
</div>

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Mantle](https://img.shields.io/badge/Mantle-Network-blue)](https://www.mantle.xyz/)
[![Tests](https://img.shields.io/badge/Tests-52%2F52%20Passing-success)](./TEST_GUIDE.md)

> **Shop, earn rewards, and generate DeFi yield - all on Mantle Network**

YieldShop is a revolutionary DeFi platform that combines e-commerce with yield generation. Users can purchase gift cards with crypto, earn cashback that generates DeFi yield, trade coupons, and access collateral-based lending - all powered by Mantle's high-performance L2 infrastructure.

## ✨ Features

### 🎁 **Dual Shopping Options**

#### Option A: Affiliate Cashback (Yield-Bearing)

- Shop through affiliate links at Amazon, Flipkart, and more
- **Earn 1% instant cashback** in stablecoins
- Cashback generates **DeFi yield** for 30 days (return period)
- Claim cashback + accumulated yield after 30 days
- Get **1% SHOP tokens** as rewards

#### Option B: Crypto Gift Cards (Instant)

- Buy gift cards directly with **MNT** or **USDC**
- Instant delivery of gift card codes
- **2-5% SHOP token rewards** on every purchase
- No waiting period - use immediately

### 🎫 **Coupon Marketplace**

- List unused coupons for sale
- Buy discounted coupons from other users
- **2% platform fee** on transactions
- Earn **1% SHOP tokens** on coupon purchases

### 💰 **Collateral-Based Lending**

- Borrow stablecoins with **150% collateralization**
- Interest rates as low as **1-5%** based on reputation
- **On-chain reputation system** (0-5 levels)
- Better rates for reliable borrowers
- No credit checks required

### ⚡ **Flash Loans**

- Uncollateralized loans for arbitrage
- **0.09% fee** on loan amount
- Must be repaid in same transaction
- Perfect for DeFi strategies

### 🪙 **SHOP Token**

- ERC20 reward token
- **1 billion** max supply
- Earn on every purchase
- Governance rights (future)

## 🏗️ Tech Stack

### Frontend

- **Next.js 15.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Wagmi 3.1** - React hooks for Web3
- **Viem 2.43** - TypeScript Ethereum library
- **RainbowKit 2.2** - Beautiful wallet connection UI
- **TanStack Query 5.90** - Data fetching & caching
- **Recharts 3.6** - Data visualization
- **Lucide React** - Icon library
- **Motion 12.23** - Animations

### Backend & Blockchain

- **Solidity 0.8.20** - Smart contracts
- **OpenZeppelin** - Battle-tested contract libraries
- **Hardhat** - Development environment
- **Mantle Network** - L2 blockchain
  - Testnet: Chain ID 5001
  - Mainnet: Chain ID 5000

### Database & APIs

- **Supabase** - PostgreSQL database & Auth
- **ipapi.co** - Geolocation API

### Testing

- **Jest** - JavaScript testing framework
- **Hardhat Tests** - Contract testing
- **52/52 tests passing** ✅

## 📦 Smart Contracts

### Deployed Contracts

| Contract              | Description            | Functions                              |
| --------------------- | ---------------------- | -------------------------------------- |
| **YieldShop**         | Main platform contract | Purchase tracking, gift cards, coupons |
| **ShopToken**         | ERC20 reward token     | Minting, burning, transfers            |
| **LendingSystem**     | Collateral-based loans | Create, repay, liquidate loans         |
| **FlashLoanProvider** | Flash loan service     | Execute flash loans                    |

### Contract Addresses (Update after deployment)

```typescript
// Mantle Testnet (Chain ID: 5001)
YIELDSHOP_CONTRACT: "0x..."; // To be deployed
SHOPTOKEN_CONTRACT: "0x..."; // To be deployed
LENDING_CONTRACT: "0x..."; // To be deployed
FLASHLOAN_CONTRACT: "0x..."; // To be deployed
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Mantle testnet MNT tokens ([Get from faucet](https://faucet.sepolia.mantle.xyz/))

### Installation

```bash
# Clone the repository
git clone https://github.com/ROHIT8759/Yield_Shop.git
cd yield_shop

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

Create a `.env` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=5e2228885bf0f4a2a399faa66e3a7cbb

# Contract Addresses (update after deployment)
NEXT_PUBLIC_YIELDSHOP_CONTRACT=0x...
NEXT_PUBLIC_SHOPTOKEN_CONTRACT=0x...
NEXT_PUBLIC_LENDING_CONTRACT=0x...
NEXT_PUBLIC_FLASHLOAN_CONTRACT=0x...

# Private Key (for contract deployment only - NEVER commit!)
PRIVATE_KEY=your_private_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run contract validation tests
npm test -- test/contract.validation.test.ts

# Run database validation tests
npm test -- test/database.validation.test.ts

# Run application integration tests
npm test -- test/app.integration.test.ts

# Run with coverage
npm test -- --coverage
```

**Test Results:** ✅ 52/52 tests passing (100%)

See [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed testing documentation.

## 📁 Project Structure

```
yield_shop/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   ├── bridge/              # Bridge page
│   ├── kyc/                 # KYC verification
│   ├── loans/               # Lending page
│   ├── rwa/                 # Real-world assets
│   ├── shop/                # Shopping page
│   └── trading/             # Trading page
├── components/              # React components
│   ├── Hero.tsx            # Hero section
│   ├── Features.tsx        # Features grid
│   ├── UserStats.tsx       # Real-time blockchain stats
│   ├── WalletTracker.tsx   # Wallet connection tracker
│   ├── Navbar.tsx          # Navigation bar
│   └── Footer.tsx          # Footer
├── contract/               # Smart contracts
│   └── yield_shop.sol     # All contracts
├── lib/                    # Utility libraries
│   └── supabase.ts        # Supabase client & functions
├── test/                   # Test files
│   ├── contract.validation.test.ts
│   ├── database.validation.test.ts
│   └── app.integration.test.ts
├── hardhat.config.ts       # Hardhat configuration
├── jest.config.js          # Jest configuration
└── next.config.ts          # Next.js configuration
```

## 🔗 Contract Deployment

### 1. Get Testnet Tokens

Visit [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz/) and get MNT tokens.

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Deploy to Mantle Testnet

```bash
npx hardhat run scripts/deploy.ts --network mantleTestnet
```

### 4. Update Environment Variables

Copy the deployed contract addresses to your `.env` file.

### 5. Verify Contracts (Optional)

```bash
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 💡 Usage

### Connect Wallet

1. Click "Connect Wallet" in the navbar
2. Select MetaMask or your preferred wallet
3. Switch to Mantle Network (will prompt if not connected)
4. Approve the connection

### Purchase Gift Card

1. Go to [Shop](http://localhost:3000/shop) page
2. Select retailer (Amazon, Flipkart, etc.)
3. Enter amount
4. Choose payment token (MNT or USDC)
5. Approve transaction
6. Receive gift card code + SHOP tokens

### Use Affiliate Cashback

1. Shop through affiliate links
2. Complete purchase on retailer site
3. Receive 1% cashback (held for 30 days)
4. Cashback generates DeFi yield automatically
5. Claim after 30 days with accumulated yield

### Borrow with Collateral

1. Go to [Loans](http://localhost:3000/loans) page
2. Deposit collateral (150% of borrow amount)
3. Borrow stablecoins
4. Interest rate based on your reputation
5. Repay anytime to get collateral back

### Trade Coupons

1. List unused coupon with expiry date
2. Set selling price (below face value)
3. Buyers purchase with crypto
4. 2% platform fee deducted
5. Earn SHOP tokens on purchase

## 📊 Database Schema

### Tables

**wallet_connections**

- Tracks wallet connections with IP/location
- Connection count & timestamps

**loan_transactions**

- All loan records with status
- Collateral & borrowed amounts

**user_reputation**

- On-chain reputation (0-5 levels)
- Loan history & repayment rate

**active_loans_summary** (View)

- Real-time active loans overview

See [schema/supabase_schema.sql](./schema/supabase_schema.sql) for full schema.

## 🔒 Security Features

✅ **ReentrancyGuard** - Prevents reentrancy attacks  
✅ **Pausable** - Emergency stop mechanism  
✅ **Ownable** - Access control for admin functions  
✅ **Input Validation** - All user inputs validated  
✅ **Collateralization** - 150% collateral required for loans  
✅ **Flash Loan Protection** - Must repay in same transaction

## 🌐 Network Information

### Mantle Testnet

- **Chain ID:** 5001
- **RPC URL:** https://rpc.testnet.mantle.xyz
- **Block Explorer:** https://explorer.testnet.mantle.xyz
- **Faucet:** https://faucet.sepolia.mantle.xyz/

### Mantle Mainnet

- **Chain ID:** 5000
- **RPC URL:** https://rpc.mantle.xyz
- **Block Explorer:** https://explorer.mantle.xyz

## 📈 Roadmap

- [x] Core platform development
- [x] Smart contract implementation
- [x] Wallet connection & tracking
- [x] Real-time blockchain stats
- [x] Database integration
- [x] Test coverage (52/52 tests)
- [ ] Contract deployment to Mantle Testnet
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Mobile app
- [ ] Governance system
- [ ] Additional retailers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by [@ROHIT8759](https://github.com/ROHIT8759)

## 🔗 Links

- **GitHub:** [https://github.com/ROHIT8759/Yield_Shop](https://github.com/ROHIT8759/Yield_Shop)
- **Demo:** Coming soon
- **Documentation:** [TEST_GUIDE.md](./TEST_GUIDE.md)

## 💬 Support

For support, questions, or feedback:

- Open an issue on GitHub
- Contact: [Your Email/Discord]

---

**Built on Mantle Network** 🚀

Made for Mantle Global Hackathon 2025
