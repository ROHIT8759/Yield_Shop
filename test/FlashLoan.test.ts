import { expect } from "chai";
import { ethers } from "hardhat";
import { FlashLoanProvider, ShopToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FlashLoanProvider", function () {
  let flashLoanProvider: FlashLoanProvider;
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

    // Deploy FlashLoanProvider
    const FlashLoanProviderFactory = await ethers.getContractFactory("FlashLoanProvider");
    flashLoanProvider = await FlashLoanProviderFactory.deploy(
      await mntToken.getAddress(),
      await usdcToken.getAddress()
    );
    await flashLoanProvider.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct token addresses", async function () {
      expect(await flashLoanProvider.mntToken()).to.equal(await mntToken.getAddress());
      expect(await flashLoanProvider.usdcToken()).to.equal(await usdcToken.getAddress());
    });

    it("Should set correct fee", async function () {
      expect(await flashLoanProvider.FLASH_LOAN_FEE()).to.equal(9);
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fee correctly", async function () {
      const amount = ethers.parseEther("10000");
      const expectedFee = amount * 9n / 10000n; // 0.09%
      
      const calculatedFee = await flashLoanProvider.calculateFee(amount);
      expect(calculatedFee).to.equal(expectedFee);
    });
  });

  describe("Liquidity Check", function () {
    it("Should return available liquidity", async function () {
      await mntToken.setYieldShopContract(owner.address);
      await mntToken.mint(await flashLoanProvider.getAddress(), ethers.parseEther("10000"));
      
      const liquidity = await flashLoanProvider.getAvailableLiquidity(await mntToken.getAddress());
      expect(liquidity).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("Pause/Unpause", function () {
    it("Should allow owner to pause", async function () {
      await flashLoanProvider.pause();
      expect(await flashLoanProvider.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await flashLoanProvider.pause();
      await flashLoanProvider.unpause();
      expect(await flashLoanProvider.paused()).to.be.false;
    });
  });
});
