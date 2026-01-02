import { expect } from "chai";
import { ethers } from "hardhat";
import { ShopToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShopToken", function () {
  let shopToken: ShopToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let yieldShop: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, yieldShop] = await ethers.getSigners();
    
    const ShopTokenFactory = await ethers.getContractFactory("ShopToken");
    shopToken = await ShopTokenFactory.deploy();
    await shopToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await shopToken.name()).to.equal("YieldShop Token");
      expect(await shopToken.symbol()).to.equal("SHOP");
    });

    it("Should set the right owner", async function () {
      expect(await shopToken.owner()).to.equal(owner.address);
    });

    it("Should have correct max supply", async function () {
      expect(await shopToken.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000000"));
    });
  });

  describe("YieldShop Contract Setup", function () {
    it("Should set YieldShop contract address", async function () {
      await shopToken.setYieldShopContract(yieldShop.address);
      expect(await shopToken.yieldShopContract()).to.equal(yieldShop.address);
    });

    it("Should fail to set YieldShop contract twice", async function () {
      await shopToken.setYieldShopContract(yieldShop.address);
      await expect(
        shopToken.setYieldShopContract(user1.address)
      ).to.be.revertedWith("Already set");
    });

    it("Should fail to set zero address", async function () {
      await expect(
        shopToken.setYieldShopContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await shopToken.setYieldShopContract(yieldShop.address);
    });

    it("Should allow YieldShop to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await shopToken.connect(yieldShop).mint(user1.address, amount);
      expect(await shopToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if non-YieldShop tries to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        shopToken.connect(user1).mint(user1.address, amount)
      ).to.be.revertedWith("Only YieldShop can mint");
    });

    it("Should fail to mint beyond max supply", async function () {
      const maxSupply = await shopToken.MAX_SUPPLY();
      await expect(
        shopToken.connect(yieldShop).mint(user1.address, maxSupply + 1n)
      ).to.be.revertedWith("Max supply exceeded");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await shopToken.setYieldShopContract(yieldShop.address);
      await shopToken.connect(yieldShop).mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("500");
      await shopToken.connect(user1).burn(burnAmount);
      expect(await shopToken.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
    });
  });
});
