# Fix Contract Permission Error

## Error Details
**Error**: "Only YieldShop can mint"
**Transaction**: Failed on Mantle Sepolia Testnet
**Issue**: YieldShop contract doesn't have permission to mint Shop tokens

## Root Cause
The ShopToken contract has a minter role check. The YieldShop contract needs to be granted minting permission.

## Solution

You need to run a transaction to grant the YieldShop contract minting permission on the ShopToken contract.

### Option 1: Using Hardhat Console

```bash
npx hardhat console --network mantleTestnet
```

Then run:
```javascript
const ShopToken = await ethers.getContractFactory("ShopToken");
const shopToken = await ShopToken.attach("0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c");

// Grant minter role to YieldShop
const MINTER_ROLE = await shopToken.MINTER_ROLE();
await shopToken.grantRole(MINTER_ROLE, "0xe1455569427b86082aFBDD21e431Bd60E21a5760");

console.log("Minter role granted to YieldShop!");
```

### Option 2: Create a Script

Create `scripts/grant-minter-role.js`:

```javascript
const hre = require("hardhat");

async function main() {
    const SHOP_TOKEN_ADDRESS = "0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c";
    const YIELDSHOP_ADDRESS = "0xe1455569427b86082aFBDD21e431Bd60E21a5760";

    console.log("Granting minter role to YieldShop...");

    const ShopToken = await hre.ethers.getContractAt("ShopToken", SHOP_TOKEN_ADDRESS);
    
    // Get minter role hash
    const MINTER_ROLE = await ShopToken.MINTER_ROLE();
    console.log("MINTER_ROLE:", MINTER_ROLE);

    // Grant role
    const tx = await ShopToken.grantRole(MINTER_ROLE, YIELDSHOP_ADDRESS);
    console.log("Transaction sent:", tx.hash);
    
    await tx.wait();
    console.log("✅ Minter role granted successfully!");

    // Verify
    const hasMinterRole = await ShopToken.hasRole(MINTER_ROLE, YIELDSHOP_ADDRESS);
    console.log("YieldShop has minter role:", hasMinterRole);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

Run:
```bash
npx hardhat run scripts/grant-minter-role.js --network mantleTestnet
```

### Option 3: Manual via Block Explorer

1. Go to ShopToken contract on Mantlescan:
   https://sepolia.mantlescan.xyz/address/0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c#writeContract

2. Connect your wallet (contract deployer)

3. Find `grantRole` function

4. Parameters:
   - **role**: Get this by calling `MINTER_ROLE()` function first (will return a bytes32 hash)
   - **account**: `0xe1455569427b86082aFBDD21e431Bd60E21a5760` (YieldShop address)

5. Click "Write" and confirm transaction

## Verify Fix

After granting the role, test by:

1. Go to your shop page
2. Try to place an order
3. Transaction should succeed now

Check on Mantlescan:
```
hasRole(MINTER_ROLE, 0xe1455569427b86082aFBDD21e431Bd60E21a5760)
```
Should return: `true`

## Contract Addresses Reference

- **ShopToken**: `0xEDCB9F6E4FAa941b97EdDE1A7C760308e37c522c`
- **YieldShop**: `0xe1455569427b86082aFBDD21e431Bd60E21a5760`
- **Network**: Mantle Sepolia Testnet

## Notes

- Only the contract owner/admin can grant roles
- Make sure you're using the wallet that deployed the ShopToken contract
- After fixing, orders will be placed successfully even if blockchain recording fails (order data is saved in database)
