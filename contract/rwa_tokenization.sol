// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title KYCRegistry
 * @notice Manages KYC verification for users
 */
contract KYCRegistry is AccessControl {
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");
    
    enum KYCStatus { None, Pending, Verified, Rejected, Suspended }
    
    struct KYCData {
        KYCStatus status;
        uint256 verifiedAt;
        uint256 expiresAt;
        string country;
        uint8 tier; // 1: Basic, 2: Intermediate, 3: Advanced
    }
    
    mapping(address => KYCData) public kycData;
    
    event KYCSubmitted(address indexed user, uint256 timestamp);
    event KYCVerified(address indexed user, uint8 tier, uint256 expiresAt);
    event KYCRejected(address indexed user, string reason);
    event KYCSuspended(address indexed user, string reason);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KYC_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Submit KYC application
     */
    function submitKYC(string calldata country) external {
        require(kycData[msg.sender].status != KYCStatus.Verified, "Already verified");
        
        kycData[msg.sender] = KYCData({
            status: KYCStatus.Pending,
            verifiedAt: 0,
            expiresAt: 0,
            country: country,
            tier: 0
        });
        
        emit KYCSubmitted(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Verify user KYC (Admin only)
     */
    function verifyKYC(
        address user,
        uint8 tier,
        uint256 validityDays
    ) external onlyRole(KYC_ADMIN_ROLE) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        require(kycData[user].status == KYCStatus.Pending, "Not pending");
        
        uint256 expiresAt = block.timestamp + (validityDays * 1 days);
        
        kycData[user].status = KYCStatus.Verified;
        kycData[user].verifiedAt = block.timestamp;
        kycData[user].expiresAt = expiresAt;
        kycData[user].tier = tier;
        
        emit KYCVerified(user, tier, expiresAt);
    }
    
    /**
     * @notice Reject KYC application
     */
    function rejectKYC(address user, string calldata reason) external onlyRole(KYC_ADMIN_ROLE) {
        kycData[user].status = KYCStatus.Rejected;
        emit KYCRejected(user, reason);
    }
    
    /**
     * @notice Suspend KYC status
     */
    function suspendKYC(address user, string calldata reason) external onlyRole(KYC_ADMIN_ROLE) {
        require(kycData[user].status == KYCStatus.Verified, "Not verified");
        kycData[user].status = KYCStatus.Suspended;
        emit KYCSuspended(user, reason);
    }
    
    /**
     * @notice Check if user is KYC verified
     */
    function isKYCVerified(address user) public view returns (bool) {
        KYCData memory data = kycData[user];
        return data.status == KYCStatus.Verified && block.timestamp < data.expiresAt;
    }
    
    /**
     * @notice Get user KYC tier
     */
    function getKYCTier(address user) public view returns (uint8) {
        if (!isKYCVerified(user)) return 0;
        return kycData[user].tier;
    }
}

/**
 * @title RWAToken
 * @notice Base token for Real World Asset tokenization
 */
contract RWAToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    enum AssetType { RealEstate, Bond, Invoice, CashFlow }
    
    struct AssetMetadata {
        AssetType assetType;
        string name;
        string description;
        string documentHash; // IPFS hash of legal documents
        uint256 totalValue; // in USD cents
        uint256 yieldRate; // annual yield in basis points (100 = 1%)
        uint256 maturityDate;
        bool isActive;
    }
    
    AssetMetadata public metadata;
    KYCRegistry public kycRegistry;
    
    mapping(address => bool) public whitelist;
    bool public whitelistEnabled;
    
    event AssetCreated(AssetType assetType, string name, uint256 totalValue);
    event YieldDistributed(uint256 amount, uint256 timestamp);
    event WhitelistUpdated(address indexed user, bool status);
    
    constructor(
        string memory name,
        string memory symbol,
        address _kycRegistry,
        AssetMetadata memory _metadata
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        kycRegistry = KYCRegistry(_kycRegistry);
        metadata = _metadata;
        whitelistEnabled = true;
        
        emit AssetCreated(_metadata.assetType, _metadata.name, _metadata.totalValue);
    }
    
    /**
     * @notice Mint tokens (only MINTER_ROLE)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(metadata.isActive, "Asset not active");
        require(kycRegistry.isKYCVerified(to), "Recipient not KYC verified");
        if (whitelistEnabled) {
            require(whitelist[to], "Recipient not whitelisted");
        }
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @notice Override transfer to include compliance checks
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        if (from != address(0) && to != address(0)) {
            require(kycRegistry.isKYCVerified(from), "Sender not KYC verified");
            require(kycRegistry.isKYCVerified(to), "Recipient not KYC verified");
            if (whitelistEnabled) {
                require(whitelist[to], "Recipient not whitelisted");
            }
        }
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @notice Update whitelist status
     */
    function updateWhitelist(address user, bool status) external onlyRole(COMPLIANCE_ROLE) {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }
    
    /**
     * @notice Toggle whitelist requirement
     */
    function setWhitelistEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistEnabled = enabled;
    }
    
    /**
     * @notice Pause token transfers
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Update asset metadata
     */
    function updateMetadata(AssetMetadata calldata _metadata) external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadata = _metadata;
    }
}

/**
 * @title RWACustody
 * @notice Custody and escrow for RWA tokens
 */
contract RWACustody is ReentrancyGuard, AccessControl {
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");
    
    struct CustodyAccount {
        uint256 balance;
        uint256 lockedUntil;
        address beneficiary;
        bool isActive;
    }
    
    mapping(address => mapping(address => CustodyAccount)) public accounts; // token => user => account
    
    event Deposited(address indexed token, address indexed user, uint256 amount);
    event Withdrawn(address indexed token, address indexed user, uint256 amount);
    event Locked(address indexed token, address indexed user, uint256 unlockTime);
    event BeneficiarySet(address indexed token, address indexed user, address beneficiary);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CUSTODIAN_ROLE, msg.sender);
    }
    
    /**
     * @notice Deposit tokens into custody
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        CustodyAccount storage account = accounts[token][msg.sender];
        account.balance += amount;
        account.isActive = true;
        
        emit Deposited(token, msg.sender, amount);
    }
    
    /**
     * @notice Withdraw tokens from custody
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        CustodyAccount storage account = accounts[token][msg.sender];
        require(account.balance >= amount, "Insufficient balance");
        require(block.timestamp >= account.lockedUntil, "Tokens locked");
        
        account.balance -= amount;
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdrawn(token, msg.sender, amount);
    }
    
    /**
     * @notice Lock tokens until specified time
     */
    function lockTokens(address token, uint256 unlockTime) external {
        require(unlockTime > block.timestamp, "Invalid unlock time");
        CustodyAccount storage account = accounts[token][msg.sender];
        require(account.balance > 0, "No balance");
        
        account.lockedUntil = unlockTime;
        emit Locked(token, msg.sender, unlockTime);
    }
    
    /**
     * @notice Set beneficiary for account
     */
    function setBeneficiary(address token, address beneficiary) external {
        require(beneficiary != address(0), "Invalid beneficiary");
        CustodyAccount storage account = accounts[token][msg.sender];
        account.beneficiary = beneficiary;
        emit BeneficiarySet(token, msg.sender, beneficiary);
    }
    
    /**
     * @notice Emergency withdrawal by custodian
     */
    function emergencyWithdraw(
        address token,
        address user,
        uint256 amount
    ) external onlyRole(CUSTODIAN_ROLE) {
        CustodyAccount storage account = accounts[token][user];
        require(account.balance >= amount, "Insufficient balance");
        
        account.balance -= amount;
        IERC20(token).transfer(user, amount);
    }
}

/**
 * @title YieldDistributor
 * @notice Distributes yield to RWA token holders
 */
contract YieldDistributor is ReentrancyGuard, AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    struct Distribution {
        uint256 id;
        address token;
        uint256 totalYield;
        uint256 timestamp;
        uint256 snapshotBlock;
        bool executed;
    }
    
    struct UserClaim {
        uint256 claimableAmount;
        uint256 claimedAmount;
        uint256 lastClaimTime;
    }
    
    uint256 public nextDistributionId;
    mapping(uint256 => Distribution) public distributions;
    mapping(uint256 => mapping(address => UserClaim)) public claims; // distributionId => user => claim
    
    IERC20 public yieldToken; // Token used for yield payments (e.g., USDC)
    
    event DistributionCreated(uint256 indexed id, address indexed token, uint256 amount);
    event YieldClaimed(uint256 indexed distributionId, address indexed user, uint256 amount);
    
    constructor(address _yieldToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        yieldToken = IERC20(_yieldToken);
    }
    
    /**
     * @notice Create new yield distribution
     */
    function createDistribution(
        address token,
        uint256 totalYield
    ) external onlyRole(DISTRIBUTOR_ROLE) returns (uint256) {
        require(totalYield > 0, "Invalid amount");
        
        yieldToken.transferFrom(msg.sender, address(this), totalYield);
        
        uint256 distributionId = nextDistributionId++;
        distributions[distributionId] = Distribution({
            id: distributionId,
            token: token,
            totalYield: totalYield,
            timestamp: block.timestamp,
            snapshotBlock: block.number - 1,
            executed: false
        });
        
        emit DistributionCreated(distributionId, token, totalYield);
        return distributionId;
    }
    
    /**
     * @notice Set claimable amounts for users (batch)
     */
    function setClaimableAmounts(
        uint256 distributionId,
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(users.length == amounts.length, "Length mismatch");
        Distribution storage dist = distributions[distributionId];
        require(!dist.executed, "Already executed");
        
        for (uint256 i = 0; i < users.length; i++) {
            claims[distributionId][users[i]].claimableAmount = amounts[i];
        }
    }
    
    /**
     * @notice Claim yield
     */
    function claimYield(uint256 distributionId) external nonReentrant {
        UserClaim storage claim = claims[distributionId][msg.sender];
        uint256 claimable = claim.claimableAmount - claim.claimedAmount;
        require(claimable > 0, "Nothing to claim");
        
        claim.claimedAmount += claimable;
        claim.lastClaimTime = block.timestamp;
        
        yieldToken.transfer(msg.sender, claimable);
        
        emit YieldClaimed(distributionId, msg.sender, claimable);
    }
    
    /**
     * @notice Get claimable amount for user
     */
    function getClaimable(uint256 distributionId, address user) external view returns (uint256) {
        UserClaim memory claim = claims[distributionId][user];
        return claim.claimableAmount - claim.claimedAmount;
    }
    
    /**
     * @notice Mark distribution as executed
     */
    function markExecuted(uint256 distributionId) external onlyRole(DISTRIBUTOR_ROLE) {
        distributions[distributionId].executed = true;
    }
}

/**
 * @title RWAFactory
 * @notice Factory for creating RWA tokens
 */
contract RWAFactory is AccessControl {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    address public kycRegistry;
    address public custodyContract;
    address public yieldDistributor;
    
    address[] public allTokens;
    mapping(address => bool) public isRWAToken;
    
    event RWATokenCreated(
        address indexed token,
        string name,
        string symbol,
        RWAToken.AssetType assetType
    );
    
    constructor(
        address _kycRegistry,
        address _custodyContract,
        address _yieldDistributor
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        
        kycRegistry = _kycRegistry;
        custodyContract = _custodyContract;
        yieldDistributor = _yieldDistributor;
    }
    
    /**
     * @notice Create new RWA token
     */
    function createRWAToken(
        string memory name,
        string memory symbol,
        RWAToken.AssetMetadata memory metadata
    ) external onlyRole(CREATOR_ROLE) returns (address) {
        RWAToken token = new RWAToken(name, symbol, kycRegistry, metadata);
        
        address tokenAddress = address(token);
        allTokens.push(tokenAddress);
        isRWAToken[tokenAddress] = true;
        
        emit RWATokenCreated(tokenAddress, name, symbol, metadata.assetType);
        return tokenAddress;
    }
    
    /**
     * @notice Get total number of RWA tokens
     */
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @notice Update contract addresses
     */
    function updateContracts(
        address _kycRegistry,
        address _custodyContract,
        address _yieldDistributor
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        kycRegistry = _kycRegistry;
        custodyContract = _custodyContract;
        yieldDistributor = _yieldDistributor;
    }
}
