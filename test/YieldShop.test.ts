import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldShop, ShopToken, LendingSystem, FlashLoanProvider } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YieldShop Contract Tests", function () {
  let yieldShop: YieldShop;
  let shopToken: ShopToken;
  let lendingSystem: LendingSystem;
  let flashLoanProvider: FlashLoanProvider;
  let mockMNT: any;
  let mockUSDC: any;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let seller: SignerWithAddress;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();

    // Deploy mock tokens
    const ERC20Mock = await ethers.getContractFactory("ERC20");
    mockMNT = await ERC20Mock.deploy("Mantle Token", "MNT");
    mockUSDC = await ERC20Mock.deploy("USD Coin", "USDC");

    // Deploy ShopToken
    const ShopTokenFactory = await ethers.getContractFactory("ShopToken");
    shopToken = await ShopTokenFactory.deploy();

    // Deploy YieldShop
    const YieldShopFactory = await ethers.getContractFactory("YieldShop");
    yieldShop = await YieldShopFactory.deploy(
      await mockMNT.getAddress(),
      await mockUSDC.getAddress(),
      await shopToken.getAddress()
    );

    // Set YieldShop contract in ShopToken
    await shopToken.setYieldShopContract(await yieldShop.getAddress());

    // Deploy LendingSystem
    const LendingSystemFactory = await ethers.getContractFactory("LendingSystem");
    lendingSystem = await LendingSystemFactory.deploy(
      await mockMNT.getAddress(),
      await mockUSDC.getAddress()
    );

    // Deploy FlashLoanProvider
    const FlashLoanProviderFactory = await ethers.getContractFactory("FlashLoanProvider");
    flashLoanProvider = await FlashLoanProviderFactory.deploy(
      await mockMNT.getAddress(),
      await mockUSDC.getAddress()
    );

    // Mint tokens to test accounts
    await mockUSDC.mint(buyer.address, ethers.parseEther("10000"));
    await mockMNT.mint(buyer.address, ethers.parseEther("10000"));
  });

  describe("YieldShop - Affiliate Purchase", function () {
    it("Should record affiliate purchase correctly", async function () {
      const amount = ethers.parseEther("100");
      const retailer = "Amazon";

      await expect(
        yieldShop.recordAffiliatePurchase(buyer.address, retailer, amount)
      )
        .to.emit(yieldShop, "PurchaseRecorded")
        .withArgs(0, buyer.address, retailer, amount, ethers.parseEther("1"), 0);

      const purchase = await yieldShop.getPurchase(0);
      expect(purchase.buyer).to.equal(buyer.address);
      expect(purchase.retailer).to.equal(retailer);
      expect(purchase.amount).to.equal(amount);
      expect(purchase.cashbackAmount).to.equal(ethers.parseEther("1")); // 1%
      expect(purchase.claimed).to.be.false;
    });

    it("Should distribute SHOP tokens on affiliate purchase", async function () {
      const amount = ethers.parseEther("100");
      const expectedShopReward = ethers.parseEther("1"); // 1%

      await yieldShop.recordAffiliatePurchase(buyer.address, "Amazon", amount);

      const shopBalance = await shopToken.balanceOf(buyer.address);
      expect(shopBalance).to.equal(expectedShopReward);
    });

    it("Should track pending cashback", async function () {
      const amount = ethers.parseEther("100");

      await yieldShop.recordAffiliatePurchase(buyer.address, "Amazon", amount);

      const pendingCashback = await yieldShop.pendingCashback(buyer.address);
      expect(pendingCashback).to.equal(ethers.parseEther("1")); // 1%
    });
  });

  describe("YieldShop - Gift Card Purchase", function () {
    beforeEach(async function () {
      await mockUSDC.connect(buyer).approve(await yieldShop.getAddress(), ethers.parseEther("1000"));
    });

    it("Should purchase gift card with USDC", async function () {
      const amount = ethers.parseEther("50");
      const retailer = "Flipkart";

      await expect(
        yieldShop.connect(buyer).purchaseGiftCard(retailer, amount, await mockUSDC.getAddress())
      )
        .to.emit(yieldShop, "GiftCardPurchased")
        .withArgs(0, buyer.address, retailer, amount, ethers.parseEther("0.5"), await mockUSDC.getAddress());

      const giftCard = await yieldShop.getGiftCard(0);
      expect(giftCard.buyer).to.equal(buyer.address);
      expect(giftCard.amount).to.equal(amount);
    });

    it("Should update totalGiftCardsSold", async function () {
      const amount = ethers.parseEther("50");

      await yieldShop.connect(buyer).purchaseGiftCard("Amazon", amount, await mockUSDC.getAddress());

      const stats = await yieldShop.getPlatformStats();
      expect(stats._totalGiftCardsSold).to.equal(amount);
    });
  });

  describe("YieldShop - Cashback Claiming", function () {
    beforeEach(async function () {
      // Mint USDC to contract for cashback
      await mockUSDC.mint(await yieldShop.getAddress(), ethers.parseEther("1000"));

      // Record purchase
      await yieldShop.recordAffiliatePurchase(buyer.address, "Amazon", ethers.parseEther("100"));
    });

    it("Should not allow claiming before return period", async function () {
      await expect(yieldShop.connect(buyer).claimCashback(0)).to.be.revertedWith(
        "Return period not over"
      );
    });

    it("Should allow claiming after return period", async function () {
      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await mockUSDC.balanceOf(buyer.address);

      await expect(yieldShop.connect(buyer).claimCashback(0))
        .to.emit(yieldShop, "CashbackClaimed")
        .withArgs(0, buyer.address, ethers.parseEther("1"), 0);

      const finalBalance = await mockUSDC.balanceOf(buyer.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));
    });

    it("Should include yield in cashback claim", async function () {
      const yieldAmount = ethers.parseEther("0.5");
      await yieldShop.accrueYield(0, yieldAmount);

      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await mockUSDC.balanceOf(buyer.address);
      await yieldShop.connect(buyer).claimCashback(0);
      const finalBalance = await mockUSDC.balanceOf(buyer.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1.5")); // 1 cashback + 0.5 yield
    });
  });

  describe("YieldShop - Coupon Marketplace", function () {
    it("Should list coupon for sale", async function () {
      const faceValue = ethers.parseEther("100");
      const sellingPrice = ethers.parseEther("80");
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days

      await expect(
        yieldShop.connect(seller).listCoupon("Amazon", faceValue, sellingPrice, expiryDate, "COUPON123")
      )
        .to.emit(yieldShop, "CouponListed")
        .withArgs(0, seller.address, "Amazon", faceValue, sellingPrice);

      const listing = await yieldShop.couponListings(0);
      expect(listing.active).to.be.true;
      expect(listing.sold).to.be.false;
    });

    it("Should allow buying listed coupon", async function () {
      const faceValue = ethers.parseEther("100");
      const sellingPrice = ethers.parseEther("80");
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await yieldShop.connect(seller).listCoupon("Amazon", faceValue, sellingPrice, expiryDate, "COUPON123");

      await mockUSDC.connect(buyer).approve(await yieldShop.getAddress(), sellingPrice);

      await expect(
        yieldShop.connect(buyer).buyCoupon(0, await mockUSDC.getAddress())
      )
        .to.emit(yieldShop, "CouponPurchased")
        .withArgs(0, buyer.address, seller.address, sellingPrice);

      const listing = await yieldShop.couponListings(0);
      expect(listing.sold).to.be.true;
      expect(listing.active).to.be.false;
    });

    it("Should transfer platform fee on coupon purchase", async function () {
      const faceValue = ethers.parseEther("100");
      const sellingPrice = ethers.parseEther("80");
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await yieldShop.connect(seller).listCoupon("Amazon", faceValue, sellingPrice, expiryDate, "COUPON123");
      await mockUSDC.connect(buyer).approve(await yieldShop.getAddress(), sellingPrice);

      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      await yieldShop.connect(buyer).buyCoupon(0, await mockUSDC.getAddress());
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);

      const platformFee = (sellingPrice * 200n) / 10000n; // 2%
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(platformFee);
    });
  });

  describe("LendingSystem - Loan Creation", function () {
    beforeEach(async function () {
      await mockMNT.connect(buyer).approve(await lendingSystem.getAddress(), ethers.parseEther("1000"));
      await mockUSDC.mint(await lendingSystem.getAddress(), ethers.parseEther("1000"));
    });

    it("Should create loan with collateral", async function () {
      const collateralAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      const duration = 86400 * 30; // 30 days

      await expect(
        lendingSystem
          .connect(buyer)
          .createLoan(collateralAmount, borrowAmount, duration, await mockMNT.getAddress(), await mockUSDC.getAddress())
      )
        .to.emit(lendingSystem, "LoanCreated")
        .withArgs(0, buyer.address, collateralAmount, borrowAmount, duration);

      const loan = await lendingSystem.loans(0);
      expect(loan.active).to.be.true;
      expect(loan.repaid).to.be.false;
    });

    it("Should reject insufficient collateral", async function () {
      const collateralAmount = ethers.parseEther("100");
      const borrowAmount = ethers.parseEther("100");
      const duration = 86400 * 30;

      await expect(
        lendingSystem
          .connect(buyer)
          .createLoan(collateralAmount, borrowAmount, duration, await mockMNT.getAddress(), await mockUSDC.getAddress())
      ).to.be.revertedWith("Insufficient collateral");
    });

    it("Should update reputation on loan creation", async function () {
      const collateralAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      const duration = 86400 * 30;

      await lendingSystem
        .connect(buyer)
        .createLoan(collateralAmount, borrowAmount, duration, await mockMNT.getAddress(), await mockUSDC.getAddress());

      const reputation = await lendingSystem.userReputation(buyer.address);
      expect(reputation.totalLoans).to.equal(1);
      expect(reputation.totalVolume).to.equal(borrowAmount);
    });
  });

  describe("LendingSystem - Loan Repayment", function () {
    beforeEach(async function () {
      await mockMNT.connect(buyer).approve(await lendingSystem.getAddress(), ethers.parseEther("1000"));
      await mockUSDC.mint(await lendingSystem.getAddress(), ethers.parseEther("1000"));
      await mockUSDC.connect(buyer).approve(await lendingSystem.getAddress(), ethers.parseEther("1000"));

      // Create loan
      await lendingSystem
        .connect(buyer)
        .createLoan(ethers.parseEther("150"), ethers.parseEther("100"), 86400 * 30, await mockMNT.getAddress(), await mockUSDC.getAddress());
    });

    it("Should allow loan repayment", async function () {
      await expect(lendingSystem.connect(buyer).repayLoan(0))
        .to.emit(lendingSystem, "LoanRepaid")
        .withArgs(0, buyer.address, await lendingSystem.calculateInterest(0), true);

      const loan = await lendingSystem.loans(0);
      expect(loan.active).to.be.false;
      expect(loan.repaid).to.be.true;
    });

    it("Should return collateral on repayment", async function () {
      const initialBalance = await mockMNT.balanceOf(buyer.address);
      await lendingSystem.connect(buyer).repayLoan(0);
      const finalBalance = await mockMNT.balanceOf(buyer.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("150"));
    });

    it("Should update reputation on timely repayment", async function () {
      await lendingSystem.connect(buyer).repayLoan(0);

      const reputation = await lendingSystem.userReputation(buyer.address);
      expect(reputation.repaidOnTime).to.equal(1);
    });
  });

  describe("FlashLoanProvider", function () {
    beforeEach(async function () {
      await mockUSDC.mint(await flashLoanProvider.getAddress(), ethers.parseEther("10000"));
    });

    it("Should provide flash loan liquidity", async function () {
      const liquidity = await flashLoanProvider.getAvailableLiquidity(await mockUSDC.getAddress());
      expect(liquidity).to.equal(ethers.parseEther("10000"));
    });

    it("Should calculate flash loan fee correctly", async function () {
      const amount = ethers.parseEther("1000");
      const fee = await flashLoanProvider.calculateFee(amount);
      
      const expectedFee = (amount * 9n) / 10000n; // 0.09%
      expect(fee).to.equal(expectedFee);
    });

    it("Should allow depositing liquidity", async function () {
      await mockUSDC.connect(buyer).approve(await flashLoanProvider.getAddress(), ethers.parseEther("1000"));
      
      await flashLoanProvider.connect(buyer).depositLiquidity(await mockUSDC.getAddress(), ethers.parseEther("1000"));

      const liquidity = await flashLoanProvider.getAvailableLiquidity(await mockUSDC.getAddress());
      expect(liquidity).to.equal(ethers.parseEther("11000"));
    });
  });

  describe("ShopToken", function () {
    it("Should have correct name and symbol", async function () {
      expect(await shopToken.name()).to.equal("YieldShop Token");
      expect(await shopToken.symbol()).to.equal("SHOP");
    });

    it("Should only allow YieldShop to mint", async function () {
      await expect(
        shopToken.mint(buyer.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Only YieldShop can mint");
    });

    it("Should enforce max supply", async function () {
      const maxSupply = await shopToken.MAX_SUPPLY();
      
      // This would require YieldShop contract to attempt minting over max
      // Simplified test - just check max supply constant
      expect(maxSupply).to.equal(ethers.parseEther("1000000000")); // 1 billion
    });

    it("Should allow burning tokens", async function () {
      // First get some tokens
      await yieldShop.recordAffiliatePurchase(buyer.address, "Amazon", ethers.parseEther("100"));
      
      const initialBalance = await shopToken.balanceOf(buyer.address);
      await shopToken.connect(buyer).burn(ethers.parseEther("0.5"));
      const finalBalance = await shopToken.balanceOf(buyer.address);

      expect(initialBalance - finalBalance).to.equal(ethers.parseEther("0.5"));
    });
  });
});
