// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title YieldShop Platform - Complete Contract Suite
 * @notice All contracts for YieldShop platform in one file for easy deployment
 * @dev Includes: YieldShop, ShopToken, LendingSystem, FlashLoanProvider, and RWA contracts
 */

// ============================================================================
// SHOP TOKEN CONTRACT
// ============================================================================

contract ShopToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    address public yieldShopContract;
    
    constructor() ERC20("YieldShop Token", "SHOP") Ownable(msg.sender) {}
    
    function setYieldShopContract(address _yieldShopContract) external onlyOwner {
        require(yieldShopContract == address(0), "Already set");
        require(_yieldShopContract != address(0), "Invalid address");
        yieldShopContract = _yieldShopContract;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == yieldShopContract, "Only YieldShop can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

// ============================================================================
// MAIN YIELDSHOP CONTRACT
// ============================================================================

contract YieldShop is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable mntToken;
    IERC20 public immutable usdcToken;
    IERC20 public immutable shopToken;
    
    uint256 public constant CASHBACK_RATE = 100;
    uint256 public constant SHOP_REWARD_RATE = 100;
    uint256 public constant RETURN_PERIOD = 30 days;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PLATFORM_FEE = 200;
    
    uint256 public totalGiftCardsSold;
    uint256 public totalCashbackDistributed;
    uint256 public totalYieldGenerated;
    
    struct Purchase {
        uint256 id;
        address buyer;
        string retailer;
        uint256 amount;
        uint256 cashbackAmount;
        uint256 yieldEarned;
        uint256 purchaseTime;
        uint256 releaseTime;
        bool claimed;
        PurchaseType purchaseType;
    }
    
    struct GiftCard {
        uint256 id;
        address buyer;
        string retailer;
        uint256 amount;
        string giftCardCode;
        uint256 shopReward;
        uint256 timestamp;
        bool redeemed;
    }
    
    struct CouponListing {
        uint256 id;
        address seller;
        string retailer;
        uint256 faceValue;
        uint256 sellingPrice;
        uint256 expiryDate;
        bytes32 couponCodeHash;
        bool active;
        bool sold;
    }
    
    enum PurchaseType { AFFILIATE_CASHBACK, CRYPTO_GIFTCARD }
    
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => GiftCard) public giftCards;
    mapping(uint256 => CouponListing) public couponListings;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256[]) public userGiftCards;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public pendingCashback;
    mapping(address => uint256) public totalYieldEarned;
    
    uint256 public nextPurchaseId;
    uint256 public nextGiftCardId;
    uint256 public nextCouponId;
    
    event PurchaseRecorded(uint256 indexed purchaseId, address indexed buyer, string retailer, uint256 amount, uint256 cashbackAmount, PurchaseType purchaseType);
    event GiftCardPurchased(uint256 indexed giftCardId, address indexed buyer, string retailer, uint256 amount, uint256 shopReward, address paymentToken);
    event CashbackClaimed(uint256 indexed purchaseId, address indexed buyer, uint256 amount, uint256 yieldEarned);
    event YieldAccrued(uint256 indexed purchaseId, uint256 yieldAmount);
    event ShopTokensDistributed(address indexed recipient, uint256 amount);
    event CouponListed(uint256 indexed couponId, address indexed seller, string retailer, uint256 faceValue, uint256 sellingPrice);
    event CouponPurchased(uint256 indexed couponId, address indexed buyer, address indexed seller, uint256 price);
    event CouponCancelled(uint256 indexed couponId);
    
    constructor(address _mntToken, address _usdcToken, address _shopToken) Ownable(msg.sender) {
        require(_mntToken != address(0) && _usdcToken != address(0) && _shopToken != address(0), "Invalid addresses");
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
        shopToken = IERC20(_shopToken);
    }
    
    function recordAffiliatePurchase(address buyer, string memory retailer, uint256 amount) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        require(buyer != address(0) && amount > 0, "Invalid params");
        
        uint256 cashbackAmount = (amount * CASHBACK_RATE) / BASIS_POINTS;
        uint256 shopReward = (amount * 100) / BASIS_POINTS;
        uint256 purchaseId = nextPurchaseId++;
        
        Purchase storage purchase = purchases[purchaseId];
        purchase.id = purchaseId;
        purchase.buyer = buyer;
        purchase.retailer = retailer;
        purchase.amount = amount;
        purchase.cashbackAmount = cashbackAmount;
        purchase.purchaseTime = block.timestamp;
        purchase.releaseTime = block.timestamp + RETURN_PERIOD;
        purchase.purchaseType = PurchaseType.AFFILIATE_CASHBACK;
        
        userPurchases[buyer].push(purchaseId);
        pendingCashback[buyer] += cashbackAmount;
        
        ShopToken(address(shopToken)).mint(buyer, shopReward);
        
        emit PurchaseRecorded(purchaseId, buyer, retailer, amount, cashbackAmount, PurchaseType.AFFILIATE_CASHBACK);
        return purchaseId;
    }
    
    function purchaseGiftCard(string memory retailer, uint256 amount, address paymentToken) external nonReentrant whenNotPaused returns (uint256) {
        require(amount > 0 && (paymentToken == address(mntToken) || paymentToken == address(usdcToken)), "Invalid params");
        
        IERC20(paymentToken).transferFrom(msg.sender, address(this), amount);
        
        uint256 shopReward = (amount * SHOP_REWARD_RATE) / BASIS_POINTS;
        uint256 giftCardId = nextGiftCardId++;
        
        GiftCard storage giftCard = giftCards[giftCardId];
        giftCard.id = giftCardId;
        giftCard.buyer = msg.sender;
        giftCard.retailer = retailer;
        giftCard.amount = amount;
        giftCard.shopReward = shopReward;
        giftCard.timestamp = block.timestamp;
        
        userGiftCards[msg.sender].push(giftCardId);
        totalGiftCardsSold += amount;
        
        if (shopReward > 0) shopToken.transfer(msg.sender, shopReward);
        
        emit GiftCardPurchased(giftCardId, msg.sender, retailer, amount, shopReward, paymentToken);
        return giftCardId;
    }
    
    function claimCashback(uint256 purchaseId) external nonReentrant whenNotPaused {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.buyer == msg.sender && !purchase.claimed && block.timestamp >= purchase.releaseTime, "Cannot claim");
        
        uint256 totalPayout = purchase.cashbackAmount + purchase.yieldEarned;
        purchase.claimed = true;
        pendingCashback[msg.sender] -= purchase.cashbackAmount;
        totalCashbackDistributed += purchase.cashbackAmount;
        
        usdcToken.transfer(msg.sender, totalPayout);
        emit CashbackClaimed(purchaseId, msg.sender, purchase.cashbackAmount, purchase.yieldEarned);
    }
    
    function listCoupon(string memory retailer, uint256 faceValue, uint256 sellingPrice, uint256 expiryDate, string memory couponCode) external nonReentrant whenNotPaused returns (uint256) {
        require(faceValue > 0 && sellingPrice < faceValue && expiryDate > block.timestamp, "Invalid params");
        
        uint256 couponId = nextCouponId++;
        CouponListing storage listing = couponListings[couponId];
        listing.id = couponId;
        listing.seller = msg.sender;
        listing.retailer = retailer;
        listing.faceValue = faceValue;
        listing.sellingPrice = sellingPrice;
        listing.expiryDate = expiryDate;
        listing.couponCodeHash = keccak256(abi.encodePacked(couponCode, msg.sender));
        listing.active = true;
        
        userListings[msg.sender].push(couponId);
        emit CouponListed(couponId, msg.sender, retailer, faceValue, sellingPrice);
        return couponId;
    }
    
    function buyCoupon(uint256 couponId, address paymentToken) external nonReentrant whenNotPaused {
        CouponListing storage listing = couponListings[couponId];
        require(listing.active && !listing.sold && listing.expiryDate > block.timestamp && msg.sender != listing.seller, "Cannot buy");
        require(paymentToken == address(mntToken) || paymentToken == address(usdcToken), "Invalid token");
        
        uint256 platformFeeAmount = (listing.sellingPrice * PLATFORM_FEE) / BASIS_POINTS;
        uint256 sellerAmount = listing.sellingPrice - platformFeeAmount;
        
        IERC20 token = IERC20(paymentToken);
        token.transferFrom(msg.sender, listing.seller, sellerAmount);
        token.transferFrom(msg.sender, owner(), platformFeeAmount);
        
        listing.sold = true;
        listing.active = false;
        
        uint256 shopReward = (listing.faceValue * SHOP_REWARD_RATE) / BASIS_POINTS;
        ShopToken(address(shopToken)).mint(msg.sender, shopReward);
        
        emit CouponPurchased(couponId, msg.sender, listing.seller, listing.sellingPrice);
    }
    
    function getUserPurchases(address user) external view returns (uint256[] memory) { return userPurchases[user]; }
    function getUserGiftCards(address user) external view returns (uint256[] memory) { return userGiftCards[user]; }
    function getPurchase(uint256 purchaseId) external view returns (Purchase memory) { return purchases[purchaseId]; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}

// ============================================================================
// LENDING SYSTEM CONTRACT
// ============================================================================

contract LendingSystem is ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable mntToken;
    IERC20 public immutable usdcToken;
    
    uint256 public constant COLLATERAL_RATIO = 15000;
    uint256 public constant INTEREST_RATE = 500;
    uint256 public constant REPUTATION_BONUS = 200;
    uint256 public nextLoanId;
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 interestRate;
        uint256 startTime;
        uint256 duration;
        bool active;
        bool repaid;
        address collateralToken;
        address borrowToken;
    }
    
    struct UserReputation {
        uint256 level;
        uint256 totalLoans;
        uint256 repaidOnTime;
        uint256 totalVolume;
        uint256 lastUpdate;
    }
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => UserReputation) public userReputation;
    
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 collateralAmount, uint256 borrowedAmount, uint256 duration);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 repaidAmount, bool onTime);
    
    constructor(address _mntToken, address _usdcToken) Ownable(msg.sender) {
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
    }
    
    function createLoan(uint256 collateralAmount, uint256 borrowAmount, uint256 duration, address collateralToken, address borrowToken) external nonReentrant whenNotPaused returns (uint256) {
        require(collateralAmount > 0 && borrowAmount > 0 && duration <= 365 days, "Invalid params");
        require(collateralAmount >= (borrowAmount * COLLATERAL_RATIO) / 10000, "Insufficient collateral");
        
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        
        uint256 loanId = nextLoanId++;
        Loan storage loan = loans[loanId];
        loan.id = loanId;
        loan.borrower = msg.sender;
        loan.collateralAmount = collateralAmount;
        loan.borrowedAmount = borrowAmount;
        loan.interestRate = calculateInterestRate(msg.sender);
        loan.startTime = block.timestamp;
        loan.duration = duration;
        loan.active = true;
        loan.collateralToken = collateralToken;
        loan.borrowToken = borrowToken;
        
        userLoans[msg.sender].push(loanId);
        IERC20(borrowToken).transfer(msg.sender, borrowAmount);
        
        UserReputation storage rep = userReputation[msg.sender];
        rep.totalLoans++;
        rep.totalVolume += borrowAmount;
        
        emit LoanCreated(loanId, msg.sender, collateralAmount, borrowAmount, duration);
        return loanId;
    }
    
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active && loan.borrower == msg.sender, "Invalid loan");
        
        uint256 interest = (loan.borrowedAmount * loan.interestRate * (block.timestamp - loan.startTime)) / (10000 * 365 days);
        uint256 totalRepayment = loan.borrowedAmount + interest;
        
        IERC20(loan.borrowToken).transferFrom(msg.sender, address(this), totalRepayment);
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);
        
        loan.active = false;
        loan.repaid = true;
        
        bool onTime = block.timestamp <= (loan.startTime + loan.duration);
        if (onTime) userReputation[msg.sender].repaidOnTime++;
        
        emit LoanRepaid(loanId, msg.sender, totalRepayment, onTime);
    }
    
    function calculateInterestRate(address user) public view returns (uint256) {
        uint256 discount = userReputation[user].level * REPUTATION_BONUS;
        return discount >= INTEREST_RATE ? 100 : INTEREST_RATE - discount;
    }
    
    function getUserLoans(address user) external view returns (uint256[] memory) { return userLoans[user]; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}

// ============================================================================
// FLASH LOAN PROVIDER CONTRACT
// ============================================================================

interface IFlashLoanReceiver {
    function executeOperation(address token, uint256 amount, uint256 fee, bytes calldata params) external returns (bool);
}

contract FlashLoanProvider is ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable mntToken;
    IERC20 public immutable usdcToken;
    
    uint256 public constant FLASH_LOAN_FEE = 9;
    uint256 public totalFlashLoans;
    uint256 public totalFeesCollected;
    
    mapping(address => uint256) public userFlashLoanCount;
    mapping(address => uint256) public userFlashLoanVolume;
    
    event FlashLoan(address indexed receiver, address indexed token, uint256 amount, uint256 fee, uint256 timestamp);
    
    constructor(address _mntToken, address _usdcToken) Ownable(msg.sender) {
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
    }
    
    function flashLoan(address receiverAddress, address token, uint256 amount, bytes calldata params) external nonReentrant whenNotPaused {
        require(amount > 0 && (token == address(mntToken) || token == address(usdcToken)), "Invalid params");
        
        IERC20 loanToken = IERC20(token);
        require(loanToken.balanceOf(address(this)) >= amount, "Insufficient liquidity");
        
        uint256 fee = (amount * FLASH_LOAN_FEE) / 10000;
        uint256 balanceBefore = loanToken.balanceOf(address(this));
        
        loanToken.transfer(receiverAddress, amount);
        require(IFlashLoanReceiver(receiverAddress).executeOperation(token, amount, fee, params), "Execution failed");
        require(loanToken.balanceOf(address(this)) >= balanceBefore + fee, "Not repaid");
        
        totalFlashLoans++;
        totalFeesCollected += fee;
        userFlashLoanCount[msg.sender]++;
        userFlashLoanVolume[msg.sender] += amount;
        
        emit FlashLoan(receiverAddress, token, amount, fee, block.timestamp);
    }
    
    function getAvailableLiquidity(address token) external view returns (uint256) { return IERC20(token).balanceOf(address(this)); }
    function calculateFee(uint256 amount) external pure returns (uint256) { return (amount * FLASH_LOAN_FEE) / 10000; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}

// ============================================================================
// KYC REGISTRY CONTRACT (RWA)
// ============================================================================

contract KYCRegistry is AccessControl {
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");
    
    enum KYCStatus { None, Pending, Verified, Rejected, Suspended }
    
    struct KYCData {
        KYCStatus status;
        uint256 verifiedAt;
        uint256 expiresAt;
        string country;
        uint8 tier;
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
    
    function submitKYC(string calldata country) external {
        require(kycData[msg.sender].status != KYCStatus.Verified, "Already verified");
        kycData[msg.sender] = KYCData(KYCStatus.Pending, 0, 0, country, 0);
        emit KYCSubmitted(msg.sender, block.timestamp);
    }
    
    function verifyKYC(address user, uint8 tier, uint256 validityDays) external onlyRole(KYC_ADMIN_ROLE) {
        require(tier >= 1 && tier <= 3 && kycData[user].status == KYCStatus.Pending, "Invalid");
        uint256 expiresAt = block.timestamp + (validityDays * 1 days);
        kycData[user] = KYCData(KYCStatus.Verified, block.timestamp, expiresAt, kycData[user].country, tier);
        emit KYCVerified(user, tier, expiresAt);
    }
    
    function rejectKYC(address user, string calldata reason) external onlyRole(KYC_ADMIN_ROLE) {
        kycData[user].status = KYCStatus.Rejected;
        emit KYCRejected(user, reason);
    }
    
    function suspendKYC(address user, string calldata reason) external onlyRole(KYC_ADMIN_ROLE) {
        require(kycData[user].status == KYCStatus.Verified, "Not verified");
        kycData[user].status = KYCStatus.Suspended;
        emit KYCSuspended(user, reason);
    }
    
    function isKYCVerified(address user) public view returns (bool) {
        return kycData[user].status == KYCStatus.Verified && block.timestamp < kycData[user].expiresAt;
    }
    
    function getKYCTier(address user) public view returns (uint8) {
        if (!isKYCVerified(user)) return 0;
        return kycData[user].tier;
    }
}

// ============================================================================
// RWA TOKEN CONTRACT
// ============================================================================

contract RWAToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    enum AssetType { RealEstate, Bond, Invoice, CashFlow }
    
    struct AssetMetadata {
        AssetType assetType;
        string name;
        string description;
        string documentHash;
        uint256 totalValue;
        uint256 yieldRate;
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
    
    constructor(string memory name, string memory symbol, address _kycRegistry, AssetMetadata memory _metadata) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        kycRegistry = KYCRegistry(_kycRegistry);
        metadata = _metadata;
        whitelistEnabled = true;
        emit AssetCreated(_metadata.assetType, _metadata.name, _metadata.totalValue);
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(metadata.isActive && kycRegistry.isKYCVerified(to), "Invalid mint");
        if (whitelistEnabled) require(whitelist[to], "Not whitelisted");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function _update(address from, address to, uint256 amount) internal virtual override whenNotPaused {
        if (from != address(0) && to != address(0)) {
            require(kycRegistry.isKYCVerified(from) && kycRegistry.isKYCVerified(to), "KYC required");
            if (whitelistEnabled) require(whitelist[to], "Not whitelisted");
        }
        super._update(from, to, amount);
    }
    
    function updateWhitelist(address user, bool status) external onlyRole(COMPLIANCE_ROLE) {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }
    
    function setWhitelistEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistEnabled = enabled;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
    
    function updateMetadata(AssetMetadata calldata _metadata) external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadata = _metadata;
    }
}

// ============================================================================
// RWA CUSTODY CONTRACT
// ============================================================================

contract RWACustody is ReentrancyGuard, AccessControl {
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");
    
    struct CustodyAccount {
        uint256 balance;
        uint256 lockedUntil;
        address beneficiary;
        bool isActive;
    }
    
    mapping(address => mapping(address => CustodyAccount)) public accounts;
    
    event Deposited(address indexed token, address indexed user, uint256 amount);
    event Withdrawn(address indexed token, address indexed user, uint256 amount);
    event Locked(address indexed token, address indexed user, uint256 unlockTime);
    event BeneficiarySet(address indexed token, address indexed user, address beneficiary);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CUSTODIAN_ROLE, msg.sender);
    }
    
    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        CustodyAccount storage account = accounts[token][msg.sender];
        account.balance += amount;
        account.isActive = true;
        emit Deposited(token, msg.sender, amount);
    }
    
    function withdraw(address token, uint256 amount) external nonReentrant {
        CustodyAccount storage account = accounts[token][msg.sender];
        require(account.balance >= amount && block.timestamp >= account.lockedUntil, "Cannot withdraw");
        account.balance -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(token, msg.sender, amount);
    }
    
    function lockTokens(address token, uint256 unlockTime) external {
        require(unlockTime > block.timestamp, "Invalid time");
        CustodyAccount storage account = accounts[token][msg.sender];
        require(account.balance > 0, "No balance");
        account.lockedUntil = unlockTime;
        emit Locked(token, msg.sender, unlockTime);
    }
    
    function setBeneficiary(address token, address beneficiary) external {
        require(beneficiary != address(0), "Invalid beneficiary");
        accounts[token][msg.sender].beneficiary = beneficiary;
        emit BeneficiarySet(token, msg.sender, beneficiary);
    }
    
    function emergencyWithdraw(address token, address user, uint256 amount) external onlyRole(CUSTODIAN_ROLE) {
        CustodyAccount storage account = accounts[token][user];
        require(account.balance >= amount, "Insufficient balance");
        account.balance -= amount;
        IERC20(token).transfer(user, amount);
    }
}

// ============================================================================
// YIELD DISTRIBUTOR CONTRACT
// ============================================================================

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
    mapping(uint256 => mapping(address => UserClaim)) public claims;
    
    IERC20 public yieldToken;
    
    event DistributionCreated(uint256 indexed id, address indexed token, uint256 amount);
    event YieldClaimed(uint256 indexed distributionId, address indexed user, uint256 amount);
    
    constructor(address _yieldToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        yieldToken = IERC20(_yieldToken);
    }
    
    function createDistribution(address token, uint256 totalYield) external onlyRole(DISTRIBUTOR_ROLE) returns (uint256) {
        require(totalYield > 0, "Invalid amount");
        yieldToken.transferFrom(msg.sender, address(this), totalYield);
        uint256 distributionId = nextDistributionId++;
        distributions[distributionId] = Distribution(distributionId, token, totalYield, block.timestamp, block.number - 1, false);
        emit DistributionCreated(distributionId, token, totalYield);
        return distributionId;
    }
    
    function setClaimableAmounts(uint256 distributionId, address[] calldata users, uint256[] calldata amounts) external onlyRole(DISTRIBUTOR_ROLE) {
        require(users.length == amounts.length && !distributions[distributionId].executed, "Invalid");
        for (uint256 i = 0; i < users.length; i++) {
            claims[distributionId][users[i]].claimableAmount = amounts[i];
        }
    }
    
    function claimYield(uint256 distributionId) external nonReentrant {
        UserClaim storage claim = claims[distributionId][msg.sender];
        uint256 claimable = claim.claimableAmount - claim.claimedAmount;
        require(claimable > 0, "Nothing to claim");
        claim.claimedAmount += claimable;
        claim.lastClaimTime = block.timestamp;
        yieldToken.transfer(msg.sender, claimable);
        emit YieldClaimed(distributionId, msg.sender, claimable);
    }
    
    function getClaimable(uint256 distributionId, address user) external view returns (uint256) {
        UserClaim memory claim = claims[distributionId][user];
        return claim.claimableAmount - claim.claimedAmount;
    }
    
    function markExecuted(uint256 distributionId) external onlyRole(DISTRIBUTOR_ROLE) {
        distributions[distributionId].executed = true;
    }
}

// ============================================================================
// RWA FACTORY CONTRACT
// ============================================================================

contract RWAFactory is AccessControl {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    address public kycRegistry;
    address public custodyContract;
    address public yieldDistributor;
    
    address[] public allTokens;
    mapping(address => bool) public isRWAToken;
    
    event RWATokenCreated(address indexed token, string name, string symbol, RWAToken.AssetType assetType);
    
    constructor(address _kycRegistry, address _custodyContract, address _yieldDistributor) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        kycRegistry = _kycRegistry;
        custodyContract = _custodyContract;
        yieldDistributor = _yieldDistributor;
    }
    
    function createRWAToken(string memory name, string memory symbol, RWAToken.AssetMetadata memory metadata) external onlyRole(CREATOR_ROLE) returns (address) {
        RWAToken token = new RWAToken(name, symbol, kycRegistry, metadata);
        address tokenAddress = address(token);
        allTokens.push(tokenAddress);
        isRWAToken[tokenAddress] = true;
        emit RWATokenCreated(tokenAddress, name, symbol, metadata.assetType);
        return tokenAddress;
    }
    
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    function updateContracts(address _kycRegistry, address _custodyContract, address _yieldDistributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        kycRegistry = _kycRegistry;
        custodyContract = _custodyContract;
        yieldDistributor = _yieldDistributor;
    }
}
