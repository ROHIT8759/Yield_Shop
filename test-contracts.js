const hre = require("hardhat");
const { expect } = require("chai");

async function main() {
    console.log("\n🧪 Starting Contract Tests...\n");

    const [owner, user1, user2] = await hre.ethers.getSigners();
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        // ============================================================================
        // TEST 1: Deploy ShopToken
        // ============================================================================
        console.log("📋 Test 1: Deploying ShopToken...");
        const ShopToken = await hre.ethers.getContractFactory("ShopToken");
        const shopToken = await ShopToken.deploy();
        await shopToken.waitForDeployment();
        const shopTokenAddress = await shopToken.getAddress();

        if (await shopToken.name() === "YieldShop Token" && await shopToken.symbol() === "SHOP") {
            console.log("✅ ShopToken deployed successfully");
            console.log(`   Address: ${shopTokenAddress}`);
            testsPassed++;
        } else {
            console.log("❌ ShopToken deployment failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 2: Deploy YieldShop
        // ============================================================================
        console.log("\n📋 Test 2: Deploying YieldShop...");
        const YieldShop = await hre.ethers.getContractFactory("YieldShop");
        const yieldShop = await YieldShop.deploy(
            "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", // MNT
            "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", // USDC
            shopTokenAddress
        );
        await yieldShop.waitForDeployment();
        const yieldShopAddress = await yieldShop.getAddress();

        if (await yieldShop.CASHBACK_RATE() === 100n) {
            console.log("✅ YieldShop deployed successfully");
            console.log(`   Address: ${yieldShopAddress}`);
            testsPassed++;
        } else {
            console.log("❌ YieldShop deployment failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 3: Set YieldShop Contract
        // ============================================================================
        console.log("\n📋 Test 3: Connecting ShopToken to YieldShop...");
        const tx = await shopToken.setYieldShopContract(yieldShopAddress);
        await tx.wait();

        if (await shopToken.yieldShopContract() === yieldShopAddress) {
            console.log("✅ ShopToken connected to YieldShop");
            testsPassed++;
        } else {
            console.log("❌ Connection failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 4: Deploy LendingSystem
        // ============================================================================
        console.log("\n📋 Test 4: Deploying LendingSystem...");
        const LendingSystem = await hre.ethers.getContractFactory("LendingSystem");
        const lendingSystem = await LendingSystem.deploy(
            "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", // MNT
            "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"  // USDC
        );
        await lendingSystem.waitForDeployment();
        const lendingSystemAddress = await lendingSystem.getAddress();

        if (await lendingSystem.COLLATERAL_RATIO() === 15000n) {
            console.log("✅ LendingSystem deployed successfully");
            console.log(`   Address: ${lendingSystemAddress}`);
            testsPassed++;
        } else {
            console.log("❌ LendingSystem deployment failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 5: Deploy FlashLoanProvider
        // ============================================================================
        console.log("\n📋 Test 5: Deploying FlashLoanProvider...");
        const FlashLoanProvider = await hre.ethers.getContractFactory("FlashLoanProvider");
        const flashLoanProvider = await FlashLoanProvider.deploy(
            "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", // MNT
            "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"  // USDC
        );
        await flashLoanProvider.waitForDeployment();
        const flashLoanAddress = await flashLoanProvider.getAddress();

        if (await flashLoanProvider.FLASH_LOAN_FEE() === 9n) {
            console.log("✅ FlashLoanProvider deployed successfully");
            console.log(`   Address: ${flashLoanAddress}`);
            testsPassed++;
        } else {
            console.log("❌ FlashLoanProvider deployment failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 6: Deploy KYCRegistry
        // ============================================================================
        console.log("\n📋 Test 6: Deploying KYCRegistry...");
        const KYCRegistry = await hre.ethers.getContractFactory("KYCRegistry");
        const kycRegistry = await KYCRegistry.deploy();
        await kycRegistry.waitForDeployment();
        const kycRegistryAddress = await kycRegistry.getAddress();
        console.log("✅ KYCRegistry deployed successfully");
        console.log(`   Address: ${kycRegistryAddress}`);
        testsPassed++;

        // ============================================================================
        // TEST 7: KYC Workflow
        // ============================================================================
        console.log("\n📋 Test 7: Testing KYC workflow...");

        // Submit KYC
        const submitTx = await kycRegistry.connect(user1).submitKYC("USA");
        await submitTx.wait();

        let kycData = await kycRegistry.kycData(user1.address);
        if (kycData.status === 1n) { // Pending
            console.log("✅ KYC submission successful");
            testsPassed++;
        } else {
            console.log("❌ KYC submission failed");
            testsFailed++;
        }

        // Verify KYC (as admin)
        const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
        const verifyTx = await kycRegistry.verifyKYC(user1.address, 2, 365);
        await verifyTx.wait();

        kycData = await kycRegistry.kycData(user1.address);
        if (kycData.status === 2n && kycData.tier === 2n) { // Verified, Tier 2
            console.log("✅ KYC verification successful");
            testsPassed++;
        } else {
            console.log("❌ KYC verification failed");
            testsFailed++;
        }

        // ============================================================================
        // TEST 8: Deploy RWACustody
        // ============================================================================
        console.log("\n📋 Test 8: Deploying RWACustody...");
        const RWACustody = await hre.ethers.getContractFactory("RWACustody");
        const rwaCustody = await RWACustody.deploy();
        await rwaCustody.waitForDeployment();
        const rwaCustodyAddress = await rwaCustody.getAddress();
        console.log("✅ RWACustody deployed successfully");
        console.log(`   Address: ${rwaCustodyAddress}`);
        testsPassed++;

        // ============================================================================
        // TEST 9: Deploy YieldDistributor
        // ============================================================================
        console.log("\n📋 Test 9: Deploying YieldDistributor...");
        const YieldDistributor = await hre.ethers.getContractFactory("YieldDistributor");
        const yieldDistributor = await YieldDistributor.deploy(
            "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9" // USDC
        );
        await yieldDistributor.waitForDeployment();
        const yieldDistributorAddress = await yieldDistributor.getAddress();
        console.log("✅ YieldDistributor deployed successfully");
        console.log(`   Address: ${yieldDistributorAddress}`);
        testsPassed++;

        // ============================================================================
        // TEST 10: Deploy RWAFactory
        // ============================================================================
        console.log("\n📋 Test 10: Deploying RWAFactory...");
        const RWAFactory = await hre.ethers.getContractFactory("RWAFactory");
        const rwaFactory = await RWAFactory.deploy(
            kycRegistryAddress,
            rwaCustodyAddress,
            yieldDistributorAddress
        );
        await rwaFactory.waitForDeployment();
        const rwaFactoryAddress = await rwaFactory.getAddress();
        console.log("✅ RWAFactory deployed successfully");
        console.log(`   Address: ${rwaFactoryAddress}`);
        testsPassed++;

        // ============================================================================
        // TEST SUMMARY
        // ============================================================================
        console.log("\n" + "=".repeat(60));
        console.log("📊 TEST SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Tests Passed: ${testsPassed}`);
        console.log(`❌ Tests Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
        console.log("=".repeat(60));

        console.log("\n📝 Deployed Contract Addresses:");
        console.log(`NEXT_PUBLIC_SHOPTOKEN_CONTRACT=${shopTokenAddress}`);
        console.log(`NEXT_PUBLIC_YIELDSHOP_CONTRACT=${yieldShopAddress}`);
        console.log(`NEXT_PUBLIC_LENDING_CONTRACT=${lendingSystemAddress}`);
        console.log(`NEXT_PUBLIC_FLASHLOAN_CONTRACT=${flashLoanAddress}`);
        console.log(`NEXT_PUBLIC_KYCREGISTRY_CONTRACT=${kycRegistryAddress}`);
        console.log(`NEXT_PUBLIC_RWACUSTODY_CONTRACT=${rwaCustodyAddress}`);
        console.log(`NEXT_PUBLIC_YIELDDISTRIBUTOR_CONTRACT=${yieldDistributorAddress}`);
        console.log(`NEXT_PUBLIC_RWAFACTORY_CONTRACT=${rwaFactoryAddress}`);

        if (testsFailed === 0) {
            console.log("\n🎉 All tests passed! Your contracts are working correctly.");
            process.exit(0);
        } else {
            console.log("\n⚠️ Some tests failed. Please review the errors above.");
            process.exit(1);
        }

    } catch (error) {
        console.error("\n❌ Error during testing:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
