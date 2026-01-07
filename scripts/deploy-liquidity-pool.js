const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🚀 Deploying Liquidity Pool Contract...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Token addresses from .env
    const MNT_TOKEN = process.env.MNT_TOKEN_ADDRESS || "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8";
    const USDC_TOKEN = process.env.USDC_TOKEN_ADDRESS || "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";
    const SHOP_TOKEN = process.env.SHOP_TOKEN_ADDRESS || "0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c";

    console.log("\n📋 Using token addresses:");
    console.log("MNT Token:", MNT_TOKEN);
    console.log("USDC Token:", USDC_TOKEN);
    console.log("SHOP Token (LP Token):", SHOP_TOKEN);

    // Deploy LiquidityPool contract
    console.log("\n🏗️  Deploying LiquidityPool...");
    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(
        MNT_TOKEN,
        USDC_TOKEN,
        SHOP_TOKEN
    );
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();

    console.log("✅ LiquidityPool deployed to:", liquidityPoolAddress);

    // Update .env file
    const envPath = path.join(__dirname, "../.env");
    let envContent = fs.readFileSync(envPath, "utf8");

    if (envContent.includes("LIQUIDITY_POOL_ADDRESS=")) {
        envContent = envContent.replace(
            /LIQUIDITY_POOL_ADDRESS=.*/,
            `LIQUIDITY_POOL_ADDRESS=${liquidityPoolAddress}`
        );
    } else {
        envContent += `\nLIQUIDITY_POOL_ADDRESS=${liquidityPoolAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Updated .env file with LiquidityPool address");

    // Setup: Set YieldShop contract if available
    const YIELDSHOP_ADDRESS = process.env.YIELDSHOP_CONTRACT_ADDRESS;
    if (YIELDSHOP_ADDRESS) {
        console.log("\n🔗 Setting up YieldShop integration...");
        const tx = await liquidityPool.setYieldShopContract(YIELDSHOP_ADDRESS);
        await tx.wait();
        console.log("✅ YieldShop contract authorized as spender");
    }

    console.log("\n📝 Deployment Summary:");
    console.log("====================");
    console.log("LiquidityPool:", liquidityPoolAddress);
    console.log("\n💡 Next Steps:");
    console.log("1. Update the LIQUIDITY_POOL_ADDRESS in app/liquidity/page.tsx");
    console.log("2. Call setLiquidityPool() on YieldShop contract with:", liquidityPoolAddress);
    console.log("3. Add initial liquidity to the pool");
    console.log("\n✨ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
