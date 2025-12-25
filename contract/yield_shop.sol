// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title YieldShop
 * @dev Main contract for the YieldShop platform - Shop & Earn DeFi Yield on Mantle
 * @notice This contract manages gift card purchases, cashback rewards, and yield generation
 */
contract YieldShop is Ownable, ReentrancyGuard, Pausable {
    
    // ============ State Variables ============
    
    IERC20 public immutable mntToken;      // Mantle token ($MNT)
    IERC20 public immutable usdcToken;     // USDC stablecoin
    IERC20 public immutable shopToken;     // $SHOP reward token
    
    uint256 public constant CASHBACK_RATE = 100;         // 1% (in basis points: 100/10000)
    uint256 public constant SHOP_REWARD_RATE = 100;      // 1% (in basis points)
    uint256 public constant RETURN_PERIOD = 30 days;
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public totalGiftCardsSold;
    uint256 public totalCashbackDistributed;
    uint256 public totalYieldGenerated;
    
    // ============ Structs ============
    
    struct Purchase {
        uint256 id;
        address buyer;
        string retailer;           // "Amazon", "Flipkart", etc.
        uint256 amount;            // Purchase amount in USD (with 18 decimals)
        uint256 cashbackAmount;    // Pending cashback
        uint256 yieldEarned;       // Yield accumulated
        uint256 purchaseTime;
        uint256 releaseTime;       // When cashback can be claimed
        bool claimed;
        PurchaseType purchaseType;
    }
    
    struct GiftCard {
        uint256 id;
        address buyer;
        string retailer;
        uint256 amount;
        string giftCardCode;       // Encrypted or hash
        uint256 shopReward;        // $SHOP tokens earned
        uint256 timestamp;
        bool redeemed;
    }
    
    enum PurchaseType {
        AFFILIATE_CASHBACK,        // Option A: Yield-bearing cashback
        CRYPTO_GIFTCARD            // Option B: Direct crypto payment
    }
    
    // ============ Mappings ============
    
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => GiftCard) public giftCards;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256[]) public userGiftCards;
    mapping(address => uint256) public pendingCashback;
    mapping(address => uint256) public totalYieldEarned;
    
    uint256 public nextPurchaseId;
    uint256 public nextGiftCardId;
    
    // ============ Events ============
    
    event PurchaseRecorded(
        uint256 indexed purchaseId,
        address indexed buyer,
        string retailer,
        uint256 amount,
        uint256 cashbackAmount,
        PurchaseType purchaseType
    );
    
    event GiftCardPurchased(
        uint256 indexed giftCardId,
        address indexed buyer,
        string retailer,
        uint256 amount,
        uint256 shopReward,
        address paymentToken
    );
    
    event CashbackClaimed(
        uint256 indexed purchaseId,
        address indexed buyer,
        uint256 amount,
        uint256 yieldEarned
    );
    
    event YieldAccrued(
        uint256 indexed purchaseId,
        uint256 yieldAmount
    );
    
    event ShopTokensDistributed(
        address indexed recipient,
        uint256 amount
    );
    
    // ============ Constructor ============
    
    constructor(
        address _mntToken,
        address _usdcToken,
        address _shopToken
    ) Ownable(msg.sender) {
        require(_mntToken != address(0), "Invalid MNT token address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_shopToken != address(0), "Invalid SHOP token address");
        
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
        shopToken = IERC20(_shopToken);
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Option A: Record an affiliate purchase for cashback
     * @dev Called by backend after user completes purchase through affiliate link
     * @param buyer Address of the buyer
     * @param retailer Name of the retailer (Amazon, Flipkart, etc.)
     * @param amount Purchase amount in USD (18 decimals)
     */
    function recordAffiliatePurchase(
        address buyer,
        string memory retailer,
        uint256 amount
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        require(buyer != address(0), "Invalid buyer address");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 cashbackAmount = (amount * CASHBACK_RATE) / BASIS_POINTS;
        uint256 shopReward = (amount * 100) / BASIS_POINTS; // 1% SHOP tokens
        uint256 purchaseId = nextPurchaseId++;
        
        Purchase storage purchase = purchases[purchaseId];
        purchase.id = purchaseId;
        purchase.buyer = buyer;
        purchase.retailer = retailer;
        purchase.amount = amount;
        purchase.cashbackAmount = cashbackAmount;
        purchase.yieldEarned = 0;
        purchase.purchaseTime = block.timestamp;
        purchase.releaseTime = block.timestamp + RETURN_PERIOD;
        purchase.claimed = false;
        purchase.purchaseType = PurchaseType.AFFILIATE_CASHBACK;
        
        userPurchases[buyer].push(purchaseId);
        pendingCashback[buyer] += cashbackAmount;
        
        // Mint and transfer 1% SHOP tokens to buyer immediately
        ShopToken(address(shopToken)).mint(buyer, shopReward);
        
        emit PurchaseRecorded(
            purchaseId,
            buyer,
            retailer,
            amount,
            cashbackAmount,
            PurchaseType.AFFILIATE_CASHBACK
        );
        
        return purchaseId;
    }
    
    /**
     * @notice Option B: Purchase gift card with crypto
     * @param retailer Name of the retailer
     * @param amount Gift card amount in USD (18 decimals)
     * @param paymentToken Address of payment token (MNT or USDC)
     */
    function purchaseGiftCard(
        string memory retailer,
        uint256 amount,
        address paymentToken
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(
            paymentToken == address(mntToken) || paymentToken == address(usdcToken),
            "Invalid payment token"
        );
        
        IERC20 token = IERC20(paymentToken);
        
        // Transfer payment from buyer
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Payment transfer failed"
        );
        
        // Calculate SHOP token reward (2-5%, we use 2% here)
        uint256 shopReward = (amount * SHOP_REWARD_RATE) / BASIS_POINTS;
        
        uint256 giftCardId = nextGiftCardId++;
        
        GiftCard storage giftCard = giftCards[giftCardId];
        giftCard.id = giftCardId;
        giftCard.buyer = msg.sender;
        giftCard.retailer = retailer;
        giftCard.amount = amount;
        giftCard.giftCardCode = ""; // To be filled by backend
        giftCard.shopReward = shopReward;
        giftCard.timestamp = block.timestamp;
        giftCard.redeemed = false;
        
        userGiftCards[msg.sender].push(giftCardId);
        totalGiftCardsSold += amount;
        
        // Distribute SHOP tokens
        if (shopReward > 0) {
            require(
                shopToken.transfer(msg.sender, shopReward),
                "SHOP token transfer failed"
            );
            emit ShopTokensDistributed(msg.sender, shopReward);
        }
        
        emit GiftCardPurchased(
            giftCardId,
            msg.sender,
            retailer,
            amount,
            shopReward,
            paymentToken
        );
        
        return giftCardId;
    }
    
    /**
     * @notice Accrue yield for a pending cashback purchase
     * @dev Called by keeper/backend to update yield based on DeFi protocol returns
     * @param purchaseId ID of the purchase
     * @param yieldAmount Amount of yield earned
     */
    function accrueYield(
        uint256 purchaseId,
        uint256 yieldAmount
    ) external onlyOwner {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.buyer != address(0), "Purchase does not exist");
        require(!purchase.claimed, "Cashback already claimed");
        
        purchase.yieldEarned += yieldAmount;
        totalYieldEarned[purchase.buyer] += yieldAmount;
        totalYieldGenerated += yieldAmount;
        
        emit YieldAccrued(purchaseId, yieldAmount);
    }
    
    /**
     * @notice Claim cashback and yield after return period
     * @param purchaseId ID of the purchase to claim
     */
    function claimCashback(uint256 purchaseId) external nonReentrant whenNotPaused {
        Purchase storage purchase = purchases[purchaseId];
        
        require(purchase.buyer == msg.sender, "Not the buyer");
        require(!purchase.claimed, "Already claimed");
        require(block.timestamp >= purchase.releaseTime, "Return period not over");
        
        uint256 totalPayout = purchase.cashbackAmount + purchase.yieldEarned;
        
        purchase.claimed = true;
        pendingCashback[msg.sender] -= purchase.cashbackAmount;
        totalCashbackDistributed += purchase.cashbackAmount;
        
        // Transfer cashback + yield (in USDC or stablecoin)
        require(
            usdcToken.transfer(msg.sender, totalPayout),
            "Cashback transfer failed"
        );
        
        emit CashbackClaimed(
            purchaseId,
            msg.sender,
            purchase.cashbackAmount,
            purchase.yieldEarned
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get all purchases for a user
     */
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    /**
     * @notice Get all gift cards for a user
     */
    function getUserGiftCards(address user) external view returns (uint256[] memory) {
        return userGiftCards[user];
    }
    
    /**
     * @notice Get purchase details
     */
    function getPurchase(uint256 purchaseId) external view returns (Purchase memory) {
        return purchases[purchaseId];
    }
    
    /**
     * @notice Get gift card details
     */
    function getGiftCard(uint256 giftCardId) external view returns (GiftCard memory) {
        return giftCards[giftCardId];
    }
    
    /**
     * @notice Calculate current APY for a user (simplified)
     */
    function getUserAPY(address user) external view returns (uint256) {
        if (pendingCashback[user] == 0) return 0;
        
        uint256 totalYield = totalYieldEarned[user];
        uint256 totalPending = pendingCashback[user];
        
        // Simplified APY calculation: (yield / pending) * 100
        // In production, this should factor in time
        return (totalYield * 10000) / totalPending; // Returns in basis points
    }
    
    /**
     * @notice Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalGiftCardsSold,
        uint256 _totalCashbackDistributed,
        uint256 _totalYieldGenerated,
        uint256 _totalUsers
    ) {
        return (
            totalGiftCardsSold,
            totalCashbackDistributed,
            totalYieldGenerated,
            nextPurchaseId // Approximate user count
        );
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set gift card code (called by backend after issuing)
     */
    function setGiftCardCode(
        uint256 giftCardId,
        string memory code
    ) external onlyOwner {
        require(giftCards[giftCardId].buyer != address(0), "Gift card does not exist");
        giftCards[giftCardId].giftCardCode = code;
    }
    
    /**
     * @notice Emergency withdraw tokens
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ Coupon Marketplace Functions ============
    
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
    
    mapping(uint256 => CouponListing) public couponListings;
    mapping(address => uint256[]) public userListings;
    uint256 public nextCouponId;
    uint256 public constant PLATFORM_FEE = 200; // 2% platform fee
    
    event CouponListed(
        uint256 indexed couponId,
        address indexed seller,
        string retailer,
        uint256 faceValue,
        uint256 sellingPrice
    );
    
    event CouponPurchased(
        uint256 indexed couponId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    event CouponCancelled(uint256 indexed couponId);
    
    /**
     * @notice List a coupon for sale
     */
    function listCoupon(
        string memory retailer,
        uint256 faceValue,
        uint256 sellingPrice,
        uint256 expiryDate,
        string memory couponCode
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(faceValue > 0, "Invalid face value");
        require(sellingPrice > 0 && sellingPrice < faceValue, "Invalid selling price");
        require(expiryDate > block.timestamp, "Coupon already expired");
        require(bytes(couponCode).length > 0, "Invalid coupon code");
        
        uint256 couponId = nextCouponId++;
        bytes32 codeHash = keccak256(abi.encodePacked(couponCode, msg.sender));
        
        CouponListing storage listing = couponListings[couponId];
        listing.id = couponId;
        listing.seller = msg.sender;
        listing.retailer = retailer;
        listing.faceValue = faceValue;
        listing.sellingPrice = sellingPrice;
        listing.expiryDate = expiryDate;
        listing.couponCodeHash = codeHash;
        listing.active = true;
        listing.sold = false;
        
        userListings[msg.sender].push(couponId);
        
        emit CouponListed(couponId, msg.sender, retailer, faceValue, sellingPrice);
        
        return couponId;
    }
    
    /**
     * @notice Buy a listed coupon with crypto
     */
    function buyCoupon(
        uint256 couponId,
        address paymentToken
    ) external nonReentrant whenNotPaused {
        CouponListing storage listing = couponListings[couponId];
        
        require(listing.active, "Coupon not active");
        require(!listing.sold, "Coupon already sold");
        require(listing.expiryDate > block.timestamp, "Coupon expired");
        require(msg.sender != listing.seller, "Cannot buy own coupon");
        require(
            paymentToken == address(mntToken) || paymentToken == address(usdcToken),
            "Invalid payment token"
        );
        
        uint256 platformFeeAmount = (listing.sellingPrice * PLATFORM_FEE) / BASIS_POINTS;
        uint256 sellerAmount = listing.sellingPrice - platformFeeAmount;
        
        IERC20 token = IERC20(paymentToken);
        
        // Transfer payment from buyer
        require(
            token.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Payment to seller failed"
        );
        
        require(
            token.transferFrom(msg.sender, owner(), platformFeeAmount),
            "Platform fee transfer failed"
        );
        
        // Mark coupon as sold
        listing.sold = true;
        listing.active = false;
        
        // Award 1% SHOP tokens to buyer
        uint256 shopReward = (listing.faceValue * SHOP_REWARD_RATE) / BASIS_POINTS;
        ShopToken(address(shopToken)).mint(msg.sender, shopReward);
        
        emit CouponPurchased(couponId, msg.sender, listing.seller, listing.sellingPrice);
    }
    
    /**
     * @notice Cancel a coupon listing
     */
    function cancelCouponListing(uint256 couponId) external {
        CouponListing storage listing = couponListings[couponId];
        
        require(msg.sender == listing.seller || msg.sender == owner(), "Not authorized");
        require(listing.active, "Coupon not active");
        require(!listing.sold, "Coupon already sold");
        
        listing.active = false;
        
        emit CouponCancelled(couponId);
    }
    
    /**
     * @notice Get all active coupon listings
     */
    function getActiveCoupons() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextCouponId; i++) {
            if (couponListings[i].active && !couponListings[i].sold && 
                couponListings[i].expiryDate > block.timestamp) {
                count++;
            }
        }
        
        uint256[] memory activeCoupons = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nextCouponId; i++) {
            if (couponListings[i].active && !couponListings[i].sold && 
                couponListings[i].expiryDate > block.timestamp) {
                activeCoupons[index] = i;
                index++;
            }
        }
        
        return activeCoupons;
    }
    
    /**
     * @notice Get user's coupon listings
     */
    function getUserCouponListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
}

/**
 * @title ShopToken
 * @dev ERC20 reward token for YieldShop platform
 */
contract ShopToken is ERC20, Ownable {
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    address public yieldShopContract;
    
    constructor() ERC20("YieldShop Token", "SHOP") Ownable(msg.sender) {}
    
    /**
     * @notice Set YieldShop contract address (can only be set once)
     */
    function setYieldShopContract(address _yieldShopContract) external onlyOwner {
        require(yieldShopContract == address(0), "Already set");
        require(_yieldShopContract != address(0), "Invalid address");
        yieldShopContract = _yieldShopContract;
    }
    
    /**
     * @notice Mint tokens (only YieldShop contract can mint)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == yieldShopContract, "Only YieldShop can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

/**
 * @title LendingSystem
 * @notice Collateral-based lending with on-chain reputation
 */
contract LendingSystem is ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable mntToken;
    IERC20 public immutable usdcToken;
    
    uint256 public constant COLLATERAL_RATIO = 15000; // 150% collateralization
    uint256 public constant INTEREST_RATE = 500; // 5% annual interest
    uint256 public constant REPUTATION_BONUS = 200; // 2% interest discount per reputation level
    uint256 public constant MAX_REPUTATION = 5; // Max reputation level
    uint256 public nextLoanId;
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 interestRate;
        uint256 startTime;
        uint256 duration; // in seconds
        bool active;
        bool repaid;
        address collateralToken;
        address borrowToken;
    }
    
    struct UserReputation {
        uint256 level; // 0-5
        uint256 totalLoans;
        uint256 repaidOnTime;
        uint256 totalVolume;
        uint256 lastUpdate;
    }
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => UserReputation) public userReputation;
    
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 duration
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 repaidAmount,
        bool onTime
    );
    
    event CollateralLiquidated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateralAmount
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 oldLevel,
        uint256 newLevel
    );
    
    constructor(address _mntToken, address _usdcToken) Ownable(msg.sender) {
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Create a new loan with collateral
     */
    function createLoan(
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 duration,
        address collateralToken,
        address borrowToken
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(collateralAmount > 0, "Invalid collateral");
        require(borrowAmount > 0, "Invalid borrow amount");
        require(duration > 0 && duration <= 365 days, "Invalid duration");
        
        // Check collateralization ratio
        uint256 requiredCollateral = (borrowAmount * COLLATERAL_RATIO) / 10000;
        require(collateralAmount >= requiredCollateral, "Insufficient collateral");
        
        // Transfer collateral from borrower
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        
        // Calculate interest rate based on reputation
        uint256 finalInterestRate = calculateInterestRate(msg.sender);
        
        // Create loan
        uint256 loanId = nextLoanId++;
        Loan storage loan = loans[loanId];
        loan.id = loanId;
        loan.borrower = msg.sender;
        loan.collateralAmount = collateralAmount;
        loan.borrowedAmount = borrowAmount;
        loan.interestRate = finalInterestRate;
        loan.startTime = block.timestamp;
        loan.duration = duration;
        loan.active = true;
        loan.repaid = false;
        loan.collateralToken = collateralToken;
        loan.borrowToken = borrowToken;
        
        userLoans[msg.sender].push(loanId);
        
        // Transfer borrowed amount to borrower
        IERC20(borrowToken).transfer(msg.sender, borrowAmount);
        
        // Update reputation stats
        UserReputation storage rep = userReputation[msg.sender];
        rep.totalLoans++;
        rep.totalVolume += borrowAmount;
        rep.lastUpdate = block.timestamp;
        
        emit LoanCreated(loanId, msg.sender, collateralAmount, borrowAmount, duration);
        
        return loanId;
    }
    
    /**
     * @notice Repay a loan
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not loan borrower");
        
        // Calculate total repayment (principal + interest)
        uint256 interest = calculateInterest(loanId);
        uint256 totalRepayment = loan.borrowedAmount + interest;
        
        // Transfer repayment from borrower
        IERC20(loan.borrowToken).transferFrom(msg.sender, address(this), totalRepayment);
        
        // Return collateral to borrower
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);
        
        // Update loan status
        loan.active = false;
        loan.repaid = true;
        
        // Check if repaid on time
        bool onTime = block.timestamp <= (loan.startTime + loan.duration);
        
        // Update reputation
        updateReputation(msg.sender, true, onTime);
        
        emit LoanRepaid(loanId, msg.sender, totalRepayment, onTime);
    }
    
    /**
     * @notice Liquidate collateral for defaulted loan
     */
    function liquidateLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(block.timestamp > loan.startTime + loan.duration, "Loan not expired");
        
        // Transfer collateral to contract owner (platform)
        IERC20(loan.collateralToken).transfer(owner(), loan.collateralAmount);
        
        // Update loan status
        loan.active = false;
        
        // Update reputation (negative impact)
        updateReputation(loan.borrower, false, false);
        
        emit CollateralLiquidated(loanId, loan.borrower, loan.collateralAmount);
    }
    
    /**
     * @notice Calculate interest for a loan
     */
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 timeElapsed = block.timestamp - loan.startTime;
        if (timeElapsed > loan.duration) {
            timeElapsed = loan.duration;
        }
        
        // Interest = (principal * rate * time) / (10000 * 365 days)
        return (loan.borrowedAmount * loan.interestRate * timeElapsed) / (10000 * 365 days);
    }
    
    /**
     * @notice Calculate interest rate based on reputation
     */
    function calculateInterestRate(address user) public view returns (uint256) {
        UserReputation memory rep = userReputation[user];
        uint256 discount = rep.level * REPUTATION_BONUS;
        
        if (discount >= INTEREST_RATE) {
            return 100; // Minimum 1% interest
        }
        
        return INTEREST_RATE - discount;
    }
    
    /**
     * @notice Update user reputation based on loan performance
     */
    function updateReputation(address user, bool repaid, bool onTime) internal {
        UserReputation storage rep = userReputation[user];
        uint256 oldLevel = rep.level;
        
        if (repaid && onTime) {
            rep.repaidOnTime++;
            
            // Calculate reputation level based on performance
            uint256 repaymentRate = (rep.repaidOnTime * 10000) / rep.totalLoans;
            
            if (repaymentRate >= 9500 && rep.totalLoans >= 10) {
                rep.level = 5;
            } else if (repaymentRate >= 9000 && rep.totalLoans >= 8) {
                rep.level = 4;
            } else if (repaymentRate >= 8000 && rep.totalLoans >= 5) {
                rep.level = 3;
            } else if (repaymentRate >= 7000 && rep.totalLoans >= 3) {
                rep.level = 2;
            } else if (repaymentRate >= 5000 && rep.totalLoans >= 1) {
                rep.level = 1;
            }
        } else {
            // Decrease reputation on default or late payment
            if (rep.level > 0) {
                rep.level--;
            }
        }
        
        if (oldLevel != rep.level) {
            emit ReputationUpdated(user, oldLevel, rep.level);
        }
        
        rep.lastUpdate = block.timestamp;
    }
    
    /**
     * @notice Get user loans
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    /**
     * @notice Get loan details
     */
    function getLoanDetails(uint256 loanId) external view returns (
        address borrower,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 interestRate,
        uint256 startTime,
        uint256 duration,
        bool active,
        bool repaid
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.collateralAmount,
            loan.borrowedAmount,
            loan.interestRate,
            loan.startTime,
            loan.duration,
            loan.active,
            loan.repaid
        );
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

/**
 * @title IFlashLoanReceiver
 * @notice Interface for flash loan receiver contracts
 */
interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata params
    ) external returns (bool);
}

/**
 * @title FlashLoanProvider
 * @notice Provides uncollateralized flash loans that must be repaid in the same transaction
 */
contract FlashLoanProvider is ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable mntToken;
    IERC20 public immutable usdcToken;
    
    uint256 public constant FLASH_LOAN_FEE = 9; // 0.09% fee (9 basis points)
    uint256 public totalFlashLoans;
    uint256 public totalFeesCollected;
    
    mapping(address => uint256) public userFlashLoanCount;
    mapping(address => uint256) public userFlashLoanVolume;
    
    event FlashLoan(
        address indexed receiver,
        address indexed token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    
    event FeesWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed to
    );
    
    constructor(address _mntToken, address _usdcToken) Ownable(msg.sender) {
        mntToken = IERC20(_mntToken);
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Execute a flash loan
     * @param receiverAddress Contract that will receive and execute the loan
     * @param token Token to borrow (MNT or USDC)
     * @param amount Amount to borrow
     * @param params Additional data to pass to receiver
     */
    function flashLoan(
        address receiverAddress,
        address token,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(
            token == address(mntToken) || token == address(usdcToken),
            "Unsupported token"
        );
        
        IERC20 loanToken = IERC20(token);
        
        // Check contract has sufficient balance
        uint256 availableBalance = loanToken.balanceOf(address(this));
        require(availableBalance >= amount, "Insufficient liquidity");
        
        // Calculate fee (0.09%)
        uint256 fee = (amount * FLASH_LOAN_FEE) / 10000;
        
        // Get balance before
        uint256 balanceBefore = loanToken.balanceOf(address(this));
        
        // Transfer loan to receiver
        require(loanToken.transfer(receiverAddress, amount), "Transfer failed");
        
        // Execute receiver's logic
        IFlashLoanReceiver receiver = IFlashLoanReceiver(receiverAddress);
        require(
            receiver.executeOperation(token, amount, fee, params),
            "Flash loan execution failed"
        );
        
        // Get balance after
        uint256 balanceAfter = loanToken.balanceOf(address(this));
        
        // Ensure loan + fee was repaid
        require(
            balanceAfter >= balanceBefore + fee,
            "Flash loan not repaid"
        );
        
        // Update stats
        totalFlashLoans++;
        totalFeesCollected += fee;
        userFlashLoanCount[msg.sender]++;
        userFlashLoanVolume[msg.sender] += amount;
        
        emit FlashLoan(receiverAddress, token, amount, fee, block.timestamp);
    }
    
    /**
     * @notice Get available liquidity for flash loans
     */
    function getAvailableLiquidity(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Calculate flash loan fee for an amount
     */
    function calculateFee(uint256 amount) external pure returns (uint256) {
        return (amount * FLASH_LOAN_FEE) / 10000;
    }
    
    /**
     * @notice Get user flash loan stats
     */
    function getUserStats(address user) external view returns (
        uint256 loanCount,
        uint256 totalVolume
    ) {
        return (userFlashLoanCount[user], userFlashLoanVolume[user]);
    }
    
    /**
     * @notice Deposit tokens to increase flash loan liquidity
     */
    function depositLiquidity(address token, uint256 amount) external {
        require(
            token == address(mntToken) || token == address(usdcToken),
            "Unsupported token"
        );
        require(amount > 0, "Invalid amount");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
    
    /**
     * @notice Withdraw collected fees (only owner)
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid amount");
        
        IERC20(token).transfer(owner(), amount);
        
        emit FeesWithdrawn(token, amount, owner());
    }
    
    /**
     * @notice Pause flash loans
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause flash loans
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw (only owner, when paused)
     */
    function emergencyWithdraw(address token) external onlyOwner whenPaused {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance");
        
        IERC20(token).transfer(owner(), balance);
    }
}
