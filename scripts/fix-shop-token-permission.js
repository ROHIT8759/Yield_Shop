require('dotenv').config();
const hre = require("hardhat");

async function main() {
    // Get addresses from .env
    const SHOP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SHOPTOKEN_CONTRACT;
    const YIELDSHOP_ADDRESS = process.env.NEXT_PUBLIC_YIELDSHOP_CONTRACT;

    console.log("🔧 Fixing ShopToken Permission Issue...\n");
    console.log("ShopToken Address:", SHOP_TOKEN_ADDRESS);
    console.log("YieldShop Address:", YIELDSHOP_ADDRESS);
    console.log("");

    // Get the deployed ShopToken contract
    const shopToken = await hre.ethers.getContractAt("ShopToken", SHOP_TOKEN_ADDRESS);

    // Check who owns the contract
    const owner = await shopToken.owner();
    console.log("ShopToken Owner:", owner);

    // Get current signer address
    const [signer] = await hre.ethers.getSigners();
    const signerAddress = await signer.getAddress();
    console.log("Your Wallet Address:", signerAddress);
    console.log("");

    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        console.log("❌ ERROR: You are not the owner of the ShopToken contract!");
        console.log("Only the owner can call setYieldShopContract()");
        console.log("");
        console.log("The owner needs to:");
        console.log(`1. Go to Mantlescan: https://sepolia.mantlescan.xyz/address/${SHOP_TOKEN_ADDRESS}#writeContract`);
        console.log("2. Connect the owner wallet");
        console.log(`3. Call setYieldShopContract with: ${YIELDSHOP_ADDRESS}`);
        return;
    }

    // Check current yieldShopContract address
    const currentYieldShop = await shopToken.yieldShopContract();
    console.log("Current YieldShop in ShopToken:", currentYieldShop);

    if (currentYieldShop === YIELDSHOP_ADDRESS) {
        console.log("✅ YieldShop contract is already set correctly!");
        return;
    }

    if (currentYieldShop !== "0x0000000000000000000000000000000000000000") {
        console.log("⚠️  YieldShop contract is already set to a different address!");
        console.log("Cannot change it (already set protection)");
        return;
    }

    console.log("\n📝 Setting YieldShop contract address...");

    // Set the YieldShop contract address
    const tx = await shopToken.setYieldShopContract(YIELDSHOP_ADDRESS);
    console.log("Transaction sent:", tx.hash);

    console.log("⏳ Waiting for confirmation...");
    await tx.wait();

    console.log("✅ YieldShop contract address set successfully!");
    console.log("");

    // Verify the change
    const newYieldShop = await shopToken.yieldShopContract();
    console.log("New YieldShop in ShopToken:", newYieldShop);

    console.log("\n🎉 Permission fix complete!");
    console.log("You can now use recordAffiliatePurchase function!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
