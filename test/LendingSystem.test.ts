import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingSystem, ShopToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LendingSystem", function () {
  let lendingSystem: LendingSystem;
  let mntToken: any;
  let usdcToken: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("ShopToken");
    mntToken = await MockERC20.deploy();
    usdcToken = await MockERC20.deploy();

    // Deploy LendingSystem
    const LendingSystemFactory = await ethers.getContractFactory("LendingSystem");
    lendingSystem = await LendingSystemFactory.deploy(
      await mntToken.getAddress(),
      await usdcToken.getAddress()
    );
    await lendingSystem.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct token addresses", async function () {
      expect(await lendingSystem.mntToken()).to.equal(await mntToken.getAddress());
      expect(await lendingSystem.usdcToken()).to.equal(await usdcToken.getAddress());
    });

    it("Should set correct constants", async function () {
      expect(await lendingSystem.COLLATERAL_RATIO()).to.equal(15000);
      expect(await lendingSystem.INTEREST_RATE()).to.equal(500);
    });
  });

  describe("Loan Creation", function () {
    beforeEach(async function () {
      // Setup tokens
      await mntToken.setYieldShopContract(owner.address);
      await usdcToken.setYieldShopContract(owner.address);
      
      await mntToken.mint(user1.address, ethers.parseEther("10000"));
      await usdcToken.mint(await lendingSystem.getAddress(), ethers.parseEther("10000"));
      
      await mntToken.connect(user1).approve(await lendingSystem.getAddress(), ethers.parseEther("10000"));
    });

    it("Should create loan with valid collateral", async function () {
      const collateral = ethers.parseEther("1500");
      const borrow = ethers.parseEther("1000");
      const duration = 30 * 24 * 60 * 60; // 30 days

      await lendingSystem.connect(user1).createLoan(
        collateral,
        borrow,
        duration,
        await mntToken.getAddress(),
        await usdcToken.getAddress()
      );

      const loan = await lendingSystem.loans(0);
      expect(loan.borrower).to.equal(user1.address);
      expect(loan.collateralAmount).to.equal(collateral);
      expect(loan.borrowedAmount).to.equal(borrow);
      expect(loan.active).to.be.true;
    });

    it("Should fail with insufficient collateral", async function () {
      const collateral = ethers.parseEther("100");
      const borrow = ethers.parseEther("1000");
      const duration = 30 * 24 * 60 * 60;

      await expect(
        lendingSystem.connect(user1).createLoan(
          collateral,
          borrow,
          duration,
          await mntToken.getAddress(),
          await usdcToken.getAddress()
        )
      ).to.be.revertedWith("Insufficient collateral");
    });

    it("Should update user reputation", async function () {
      const collateral = ethers.parseEther("1500");
      const borrow = ethers.parseEther("1000");
      const duration = 30 * 24 * 60 * 60;

      await lendingSystem.connect(user1).createLoan(
        collateral,
        borrow,
        duration,
        await mntToken.getAddress(),
        await usdcToken.getAddress()
      );

      const reputation = await lendingSystem.userReputation(user1.address);
      expect(reputation.totalLoans).to.equal(1);
      expect(reputation.totalVolume).to.equal(borrow);
    });
  });

  describe("Interest Rate Calculation", function () {
    it("Should calculate base interest rate for new users", async function () {
      const interestRate = await lendingSystem.calculateInterestRate(user1.address);
      expect(interestRate).to.equal(500);
    });
  });
});
