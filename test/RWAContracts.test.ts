import { expect } from "chai";
import { ethers } from "hardhat";
import { KYCRegistry, RWAToken, RWACustody, YieldDistributor, RWAFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RWA Contracts Integration", function () {
  let kycRegistry: KYCRegistry;
  let rwaToken: RWAToken;
  let rwaCustody: RWACustody;
  let yieldDistributor: YieldDistributor;
  let rwaFactory: RWAFactory;
  let usdcToken: any;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, admin, user1, user2] = await ethers.getSigners();

    // Deploy KYCRegistry
    const KYCRegistryFactory = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistryFactory.deploy();
    await kycRegistry.waitForDeployment();

    const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
    await kycRegistry.grantRole(KYC_ADMIN_ROLE, admin.address);

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("ShopToken");
    usdcToken = await MockERC20.deploy();
    await usdcToken.setYieldShopContract(owner.address);

    // Deploy RWACustody
    const RWACustodyFactory = await ethers.getContractFactory("RWACustody");
    rwaCustody = await RWACustodyFactory.deploy();
    await rwaCustody.waitForDeployment();

    // Deploy YieldDistributor
    const YieldDistributorFactory = await ethers.getContractFactory("YieldDistributor");
    yieldDistributor = await YieldDistributorFactory.deploy(await usdcToken.getAddress());
    await yieldDistributor.waitForDeployment();

    // Deploy RWAFactory
    const RWAFactoryFactory = await ethers.getContractFactory("RWAFactory");
    rwaFactory = await RWAFactoryFactory.deploy(
      await kycRegistry.getAddress(),
      await rwaCustody.getAddress(),
      await yieldDistributor.getAddress()
    );
    await rwaFactory.waitForDeployment();
  });

  describe("RWAToken with KYC", function () {
    beforeEach(async function () {
      // Create metadata
      const metadata = {
        assetType: 0, // RealEstate
        name: "NYC Property",
        description: "Commercial building",
        documentHash: "QmHash",
        totalValue: ethers.parseUnits("100000000", 6), // $100M in cents
        yieldRate: 500, // 5%
        maturityDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        isActive: true
      };

      const RWATokenFactory = await ethers.getContractFactory("RWAToken");
      rwaToken = await RWATokenFactory.deploy(
        "Real Estate Token",
        "RET",
        await kycRegistry.getAddress(),
        metadata
      );
      await rwaToken.waitForDeployment();
    });

    it("Should deploy with correct metadata", async function () {
      const metadata = await rwaToken.metadata();
      expect(metadata.name).to.equal("NYC Property");
      expect(metadata.assetType).to.equal(0);
    });

    it("Should require KYC for minting", async function () {
      const MINTER_ROLE = await rwaToken.MINTER_ROLE();
      await rwaToken.grantRole(MINTER_ROLE, owner.address);

      await expect(
        rwaToken.mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Invalid mint");
    });

    it("Should allow minting to KYC verified user", async function () {
      // Verify KYC
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 2, 365);

      // Whitelist user
      const COMPLIANCE_ROLE = await rwaToken.COMPLIANCE_ROLE();
      await rwaToken.grantRole(COMPLIANCE_ROLE, owner.address);
      await rwaToken.updateWhitelist(user1.address, true);

      // Mint tokens
      const MINTER_ROLE = await rwaToken.MINTER_ROLE();
      await rwaToken.grantRole(MINTER_ROLE, owner.address);
      await rwaToken.mint(user1.address, ethers.parseEther("100"));

      expect(await rwaToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should require KYC for transfers", async function () {
      // Setup both users with KYC
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 2, 365);
      
      await kycRegistry.connect(user2).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user2.address, 2, 365);

      // Whitelist users
      const COMPLIANCE_ROLE = await rwaToken.COMPLIANCE_ROLE();
      await rwaToken.grantRole(COMPLIANCE_ROLE, owner.address);
      await rwaToken.updateWhitelist(user1.address, true);
      await rwaToken.updateWhitelist(user2.address, true);

      // Mint to user1
      const MINTER_ROLE = await rwaToken.MINTER_ROLE();
      await rwaToken.grantRole(MINTER_ROLE, owner.address);
      await rwaToken.mint(user1.address, ethers.parseEther("100"));

      // Transfer
      await rwaToken.connect(user1).transfer(user2.address, ethers.parseEther("50"));
      expect(await rwaToken.balanceOf(user2.address)).to.equal(ethers.parseEther("50"));
    });
  });

  describe("RWACustody", function () {
    let testToken: any;

    beforeEach(async function () {
      const MockERC20 = await ethers.getContractFactory("ShopToken");
      testToken = await MockERC20.deploy();
      await testToken.setYieldShopContract(owner.address);
      await testToken.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow deposits", async function () {
      await testToken.connect(user1).approve(await rwaCustody.getAddress(), ethers.parseEther("100"));
      await rwaCustody.connect(user1).deposit(await testToken.getAddress(), ethers.parseEther("100"));

      const account = await rwaCustody.accounts(await testToken.getAddress(), user1.address);
      expect(account.balance).to.equal(ethers.parseEther("100"));
    });

    it("Should allow withdrawals", async function () {
      await testToken.connect(user1).approve(await rwaCustody.getAddress(), ethers.parseEther("100"));
      await rwaCustody.connect(user1).deposit(await testToken.getAddress(), ethers.parseEther("100"));
      await rwaCustody.connect(user1).withdraw(await testToken.getAddress(), ethers.parseEther("50"));

      const account = await rwaCustody.accounts(await testToken.getAddress(), user1.address);
      expect(account.balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("YieldDistributor", function () {
    it("Should create distribution", async function () {
      const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
      await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, owner.address);

      await usdcToken.mint(owner.address, ethers.parseEther("10000"));
      await usdcToken.approve(await yieldDistributor.getAddress(), ethers.parseEther("10000"));

      await yieldDistributor.createDistribution(
        await usdcToken.getAddress(),
        ethers.parseEther("1000")
      );

      const distribution = await yieldDistributor.distributions(0);
      expect(distribution.totalYield).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("RWAFactory", function () {
    it("Should create new RWA token", async function () {
      const CREATOR_ROLE = await rwaFactory.CREATOR_ROLE();
      await rwaFactory.grantRole(CREATOR_ROLE, owner.address);

      const metadata = {
        assetType: 1, // Bond
        name: "Corporate Bond",
        description: "AAA rated corporate bond",
        documentHash: "QmBondHash",
        totalValue: ethers.parseUnits("50000000", 6),
        yieldRate: 300,
        maturityDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        isActive: true
      };

      const tx = await rwaFactory.createRWAToken("Bond Token", "BOND", metadata);
      await tx.wait();

      expect(await rwaFactory.totalTokens()).to.equal(1);
      const tokenAddress = await rwaFactory.allTokens(0);
      expect(await rwaFactory.isRWAToken(tokenAddress)).to.be.true;
    });
  });
});
