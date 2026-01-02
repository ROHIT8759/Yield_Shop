import { expect } from "chai";
import { ethers } from "hardhat";
import { KYCRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("KYCRegistry", function () {
  let kycRegistry: KYCRegistry;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, admin, user1] = await ethers.getSigners();

    const KYCRegistryFactory = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistryFactory.deploy();
    await kycRegistry.waitForDeployment();

    // Grant admin role
    const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
    await kycRegistry.grantRole(KYC_ADMIN_ROLE, admin.address);
  });

  describe("Deployment", function () {
    it("Should grant admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await kycRegistry.DEFAULT_ADMIN_ROLE();
      expect(await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("KYC Submission", function () {
    it("Should allow user to submit KYC", async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
      const kycData = await kycRegistry.kycData(user1.address);
      expect(kycData.status).to.equal(1); // Pending
      expect(kycData.country).to.equal("USA");
    });

    it("Should fail if already verified", async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 1, 365);
      
      await expect(
        kycRegistry.connect(user1).submitKYC("USA")
      ).to.be.revertedWith("Already verified");
    });
  });

  describe("KYC Verification", function () {
    beforeEach(async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
    });

    it("Should allow admin to verify KYC", async function () {
      await kycRegistry.connect(admin).verifyKYC(user1.address, 2, 365);
      
      const kycData = await kycRegistry.kycData(user1.address);
      expect(kycData.status).to.equal(2); // Verified
      expect(kycData.tier).to.equal(2);
    });

    it("Should fail with invalid tier", async function () {
      await expect(
        kycRegistry.connect(admin).verifyKYC(user1.address, 5, 365)
      ).to.be.revertedWith("Invalid");
    });

    it("Should fail if not admin", async function () {
      await expect(
        kycRegistry.connect(user1).verifyKYC(user1.address, 2, 365)
      ).to.be.reverted;
    });
  });

  describe("KYC Status Check", function () {
    it("Should return false for non-verified user", async function () {
      expect(await kycRegistry.isKYCVerified(user1.address)).to.be.false;
    });

    it("Should return true for verified user", async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 2, 365);
      
      expect(await kycRegistry.isKYCVerified(user1.address)).to.be.true;
    });
  });

  describe("KYC Tier", function () {
    it("Should return tier for verified user", async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 3, 365);
      
      expect(await kycRegistry.getKYCTier(user1.address)).to.equal(3);
    });

    it("Should return 0 for non-verified user", async function () {
      expect(await kycRegistry.getKYCTier(user1.address)).to.equal(0);
    });
  });

  describe("KYC Rejection", function () {
    beforeEach(async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
    });

    it("Should allow admin to reject KYC", async function () {
      await kycRegistry.connect(admin).rejectKYC(user1.address, "Invalid documents");
      
      const kycData = await kycRegistry.kycData(user1.address);
      expect(kycData.status).to.equal(3); // Rejected
    });
  });

  describe("KYC Suspension", function () {
    beforeEach(async function () {
      await kycRegistry.connect(user1).submitKYC("USA");
      await kycRegistry.connect(admin).verifyKYC(user1.address, 2, 365);
    });

    it("Should allow admin to suspend KYC", async function () {
      await kycRegistry.connect(admin).suspendKYC(user1.address, "Suspicious activity");
      
      const kycData = await kycRegistry.kycData(user1.address);
      expect(kycData.status).to.equal(4); // Suspended
    });
  });
});
