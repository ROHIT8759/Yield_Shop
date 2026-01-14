export const YIELDSHOP_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_mntToken", "type": "address" },
      { "internalType": "address", "name": "_usdcToken", "type": "address" },
      { "internalType": "address", "name": "_shopToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "buyer", "type": "address" },
      { "internalType": "string", "name": "retailer", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "recordAffiliatePurchase",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "retailer", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "paymentToken", "type": "address" }
    ],
    "name": "purchaseGiftCard",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "purchaseId", "type": "uint256" }],
    "name": "claimCashback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserPurchases",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserGiftCards",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "purchaseId", "type": "uint256" }],
    "name": "getPurchase",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "string", "name": "retailer", "type": "string" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "cashbackAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "yieldEarned", "type": "uint256" },
          { "internalType": "uint256", "name": "purchaseTime", "type": "uint256" },
          { "internalType": "uint256", "name": "releaseTime", "type": "uint256" },
          { "internalType": "bool", "name": "claimed", "type": "bool" },
          { "internalType": "enum YieldShop.PurchaseType", "name": "purchaseType", "type": "uint8" }
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
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserAPY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalGiftCardsSold", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalCashbackDistributed", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalYieldGenerated", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalUsers", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "retailer", "type": "string" },
      { "internalType": "uint256", "name": "faceValue", "type": "uint256" },
      { "internalType": "uint256", "name": "sellingPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
      { "internalType": "string", "name": "couponCode", "type": "string" }
    ],
    "name": "listCoupon",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "couponId", "type": "uint256" },
      { "internalType": "address", "name": "paymentToken", "type": "address" }
    ],
    "name": "buyCoupon",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "couponId", "type": "uint256" }],
    "name": "cancelCouponListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveCoupons",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "couponId", "type": "uint256" }],
    "name": "couponListings",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "seller", "type": "address" },
      { "internalType": "string", "name": "retailer", "type": "string" },
      { "internalType": "uint256", "name": "faceValue", "type": "uint256" },
      { "internalType": "uint256", "name": "sellingPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
      { "internalType": "bytes32", "name": "couponCodeHash", "type": "bytes32" },
      { "internalType": "bool", "name": "active", "type": "bool" },
      { "internalType": "bool", "name": "sold", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserCouponListings",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ShopToken ABI (ERC20 with minting)
export const SHOPTOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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
      { "internalType": "uint256", "name": "collateralAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "borrowAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "address", "name": "collateralToken", "type": "address" },
      { "internalType": "address", "name": "borrowToken", "type": "address" }
    ],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "repayLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "outputs": []
  },
  {
    "name": "liquidateLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "outputs": []
  },
  {
    "name": "loans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "borrower", "type": "address" },
      { "internalType": "uint256", "name": "collateralAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "borrowedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "bool", "name": "active", "type": "bool" },
      { "internalType": "bool", "name": "repaid", "type": "bool" },
      { "internalType": "address", "name": "collateralToken", "type": "address" },
      { "internalType": "address", "name": "borrowToken", "type": "address" }
    ]
  },
  {
    "name": "userReputation",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [
      { "internalType": "uint256", "name": "level", "type": "uint256" },
      { "internalType": "uint256", "name": "totalLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "repaidOnTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalVolume", "type": "uint256" },
      { "internalType": "uint256", "name": "lastUpdate", "type": "uint256" }
    ]
  },
  {
    "name": "calculateInterestRate",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "calculateInterest",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "getUserLoans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }]
  }
] as const;

// Flash Loan Provider ABI
export const FLASHLOAN_ABI = [
  {
    "name": "flashLoan",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "internalType": "address", "name": "receiverAddress", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bytes", "name": "params", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "name": "getAvailableLiquidity",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "calculateFee",
    "type": "function",
    "stateMutability": "pure",
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "getUserStats",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [
      { "internalType": "uint256", "name": "loanCount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalVolume", "type": "uint256" }
    ]
  },
  {
    "name": "depositLiquidity",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "totalFlashLoans",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "totalFeesCollected",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "userFlashLoanCount",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  },
  {
    "name": "userFlashLoanVolume",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
  }
] as const;

// Liquidity Pool ABI
export const LIQUIDITY_POOL_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "mntAmount", "type": "uint256" }, { "internalType": "uint256", "name": "usdcAmount", "type": "uint256" }],
    "name": "addLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "lpTokensToMint", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "lpTokenAmount", "type": "uint256" }],
    "name": "removeLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "mntAmount", "type": "uint256" }, { "internalType": "uint256", "name": "usdcAmount", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolStats",
    "outputs": [
      { "internalType": "uint256", "name": "mntLiquidity", "type": "uint256" },
      { "internalType": "uint256", "name": "usdcLiquidity", "type": "uint256" },
      { "internalType": "uint256", "name": "lpSupply", "type": "uint256" },
      { "internalType": "uint256", "name": "feesCollected", "type": "uint256" },
      { "internalType": "uint256", "name": "shoppingVolume", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserLiquidity",
    "outputs": [
      { "internalType": "uint256", "name": "mntDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "usdcDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "lpTokens", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardsEarned", "type": "uint256" },
      { "internalType": "uint256", "name": "depositTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_yieldShopContract", "type": "address" }],
    "name": "setYieldShopContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "bool", "name": "authorized", "type": "bool" }],
    "name": "setAuthorizedSpender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "paymentToken", "type": "address" }],
    "name": "processShoppingPayment",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMNTLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalUSDCLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalFeesCollected",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalShoppingVolume",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses (Update these with deployed contract addresses)
export const CONTRACTS = {
  YIELDSHOP: (process.env.NEXT_PUBLIC_YIELDSHOP_CONTRACT || '0xe1455569427b86082aFBDD21e431Bd60E21a5760') as `0x${string}`,
  LENDING: (process.env.NEXT_PUBLIC_LENDING_CONTRACT || '0xE7f99F00ca02d5746F40f818585C187734038e6F') as `0x${string}`,
  FLASHLOAN: (process.env.NEXT_PUBLIC_FLASHLOAN_CONTRACT || '0x16d6E9232F3195EE82Ec9ee6d7055234E5849ADb') as `0x${string}`,
  MNT: (process.env.NEXT_PUBLIC_MNT_ADDRESS || '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8') as `0x${string}`,
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9') as `0x${string}`,
  SHOP: (process.env.NEXT_PUBLIC_SHOPTOKEN_CONTRACT || '0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c') as `0x${string}`,
  LIQUIDITY_POOL: (process.env.NEXT_PUBLIC_LIQUIDITYPOOL_CONTRACT || '0xE853Fc635620e83021519C3B0D69cea90046e55f') as `0x${string}`,
};
