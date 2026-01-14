// RWA Tokenization Contract ABIs and Addresses

export const RWA_CONTRACTS = {
  KYC_REGISTRY: process.env.NEXT_PUBLIC_KYCREGISTRY_CONTRACT || '0xd26c6Be0CA5AD7A77FdB3e98A1BAD8eC87162854',
  RWA_CUSTODY: process.env.NEXT_PUBLIC_RWACUSTODY_CONTRACT || '0xA5F081116C15C5b4010B3a16Fd6B5FA04F5Ad06c',
  YIELD_DISTRIBUTOR: process.env.NEXT_PUBLIC_YIELDDISTRIBUTOR_CONTRACT || '0x4FD2123CdC146A733568bC04641e6F6dd3e3F3bc',
  RWA_FACTORY: process.env.NEXT_PUBLIC_RWAFACTORY_CONTRACT || '0x541e0d653e2ba17e855a15cba6a95d43596f71dd',
  RWA_TOKEN: process.env.NEXT_PUBLIC_RWATOKEN_CONTRACT || '0xaCD628306E1831C1105390D5f2EeBa31E06bf8Db',
};

export const KYC_REGISTRY_ABI = [
  'function submitKYC(string country) external',
  'function isKYCVerified(address user) external view returns (bool)',
  'function getKYCTier(address user) external view returns (uint8)',
  'function kycData(address user) external view returns (uint8 status, uint256 verifiedAt, uint256 expiresAt, string country, uint8 tier)',
] as const;

export const RWA_TOKEN_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function metadata() external view returns (uint8 assetType, string name, string description, string documentHash, uint256 totalValue, uint256 yieldRate, uint256 maturityDate, bool isActive)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
] as const;

export const RWA_CUSTODY_ABI = [
  'function deposit(address token, uint256 amount) external',
  'function withdraw(address token, uint256 amount) external',
  'function lockTokens(address token, uint256 unlockTime) external',
  'function setBeneficiary(address token, address beneficiary) external',
  'function accounts(address token, address user) external view returns (uint256 balance, uint256 lockedUntil, address beneficiary, bool isActive)',
] as const;

export const YIELD_DISTRIBUTOR_ABI = [
  'function claimYield(uint256 distributionId) external',
  'function getClaimable(uint256 distributionId, address user) external view returns (uint256)',
  'function distributions(uint256 id) external view returns (uint256 id, address token, uint256 totalYield, uint256 timestamp, uint256 snapshotBlock, bool executed)',
  'function claims(uint256 distributionId, address user) external view returns (uint256 claimableAmount, uint256 claimedAmount, uint256 lastClaimTime)',
] as const;

export const RWA_FACTORY_ABI = [
  'function allTokens(uint256 index) external view returns (address)',
  'function totalTokens() external view returns (uint256)',
  'function isRWAToken(address token) external view returns (bool)',
] as const;

export const ASSET_TYPES = {
  0: 'Real Estate',
  1: 'Bond',
  2: 'Invoice',
  3: 'Cash Flow',
} as const;

export const KYC_STATUS = {
  0: 'None',
  1: 'Pending',
  2: 'Verified',
  3: 'Rejected',
  4: 'Suspended',
} as const;

export const KYC_TIERS = {
  0: 'Not Verified',
  1: 'Basic',
  2: 'Intermediate',
  3: 'Advanced',
} as const;
