export const YIELDSHOP_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_mntToken", "type": "address"},
      {"internalType": "address", "name": "_usdcToken", "type": "address"},
      {"internalType": "address", "name": "_shopToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "string", "name": "retailer", "type": "string"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "recordAffiliatePurchase",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "retailer", "type": "string"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "paymentToken", "type": "address"}
    ],
    "name": "purchaseGiftCard",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "purchaseId", "type": "uint256"}],
    "name": "claimCashback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserPurchases",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserGiftCards",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "purchaseId", "type": "uint256"}],
    "name": "getPurchase",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "buyer", "type": "address"},
          {"internalType": "string", "name": "retailer", "type": "string"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "cashbackAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "yieldEarned", "type": "uint256"},
          {"internalType": "uint256", "name": "purchaseTime", "type": "uint256"},
          {"internalType": "uint256", "name": "releaseTime", "type": "uint256"},
          {"internalType": "bool", "name": "claimed", "type": "bool"},
          {"internalType": "enum YieldShop.PurchaseType", "name": "purchaseType", "type": "uint8"}
        ],
        "internalType": "struct YieldShop.Purchase",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserAPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalGiftCardsSold", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalCashbackDistributed", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalYieldGenerated", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalUsers", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "retailer", "type": "string"},
      {"internalType": "uint256", "name": "faceValue", "type": "uint256"},
      {"internalType": "uint256", "name": "sellingPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
      {"internalType": "string", "name": "couponCode", "type": "string"}
    ],
    "name": "listCoupon",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "couponId", "type": "uint256"},
      {"internalType": "address", "name": "paymentToken", "type": "address"}
    ],
    "name": "buyCoupon",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "couponId", "type": "uint256"}],
    "name": "cancelCouponListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveCoupons",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "couponId", "type": "uint256"}],
    "name": "couponListings",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "string", "name": "retailer", "type": "string"},
      {"internalType": "uint256", "name": "faceValue", "type": "uint256"},
      {"internalType": "uint256", "name": "sellingPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
      {"internalType": "bytes32", "name": "couponCodeHash", "type": "bytes32"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "bool", "name": "sold", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserCouponListings",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Lending System ABI
export const LENDING_ABI = [
  {
    "name": "createLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"internalType": "uint256", "name": "collateralAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "borrowAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"},
      {"internalType": "address", "name": "collateralToken", "type": "address"},
      {"internalType": "address", "name": "borrowToken", "type": "address"}
    ],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "repayLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "outputs": []
  },
  {
    "name": "liquidateLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "outputs": []
  },
  {
    "name": "loans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "borrower", "type": "address"},
      {"internalType": "uint256", "name": "collateralAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "borrowedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "interestRate", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "bool", "name": "repaid", "type": "bool"},
      {"internalType": "address", "name": "collateralToken", "type": "address"},
      {"internalType": "address", "name": "borrowToken", "type": "address"}
    ]
  },
  {
    "name": "userReputation",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [
      {"internalType": "uint256", "name": "level", "type": "uint256"},
      {"internalType": "uint256", "name": "totalLoans", "type": "uint256"},
      {"internalType": "uint256", "name": "repaidOnTime", "type": "uint256"},
      {"internalType": "uint256", "name": "totalVolume", "type": "uint256"},
      {"internalType": "uint256", "name": "lastUpdate", "type": "uint256"}
    ]
  },
  {
    "name": "calculateInterestRate",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "calculateInterest",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "uint256", "name": "loanId", "type": "uint256"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "getUserLoans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}]
  }
] as const;

// Flash Loan Provider ABI
export const FLASHLOAN_ABI = [
  {
    "name": "flashLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"internalType": "address", "name": "receiverAddress", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bytes", "name": "params", "type": "bytes"}
    ],
    "outputs": []
  },
  {
    "name": "getAvailableLiquidity",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "calculateFee",
    "type": "function",
    "stateMutability": "pure",
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "getUserStats",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [
      {"internalType": "uint256", "name": "loanCount", "type": "uint256"},
      {"internalType": "uint256", "name": "totalVolume", "type": "uint256"}
    ]
  },
  {
    "name": "depositLiquidity",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "outputs": []
  },
  {
    "name": "totalFlashLoans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "totalFeesCollected",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "userFlashLoanCount",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  },
  {
    "name": "userFlashLoanVolume",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}]
  }
] as const;

// Contract addresses (Update these with deployed contract addresses)
export const CONTRACTS = {
  YIELDSHOP: '0x1234567890123456789012345678901234567890' as `0x${string}`, // Replace with deployed contract
  LENDING: '0x1234567890123456789012345678901234567892' as `0x${string}`, // Replace with deployed lending contract
  FLASHLOAN: '0x1234567890123456789012345678901234567893' as `0x${string}`, // Replace with deployed flash loan contract
  MNT: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8' as `0x${string}`, // Wrapped MNT on Mantle
  USDC: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9' as `0x${string}`, // USDC on Mantle
  SHOP: '0x1234567890123456789012345678901234567891' as `0x${string}`, // Replace with deployed SHOP token
};

