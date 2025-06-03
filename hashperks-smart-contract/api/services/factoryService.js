// backend/services/factoryService.js
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

let factorySigner;
if (process.env.FACTORY_DEPLOYER_PRIVATE_KEY) {
  // Use a specific key for factory interactions
  try {
    factorySigner = new ethers.Wallet(process.env.FACTORY_DEPLOYER_PRIVATE_KEY, provider);
    console.log(`[FactoryService] Factory signer configured with address: ${factorySigner.address}`);
    // NEW LOGS: Verify signer's provider and attempt to get balance
    if (factorySigner.provider) {
      console.log(`[FactoryService] Factory signer has a provider.`);
      factorySigner.provider
        .getBalance(factorySigner.address)
        .then((balance) => {
          console.log(`[FactoryService] Factory signer balance: ${ethers.formatEther(balance)} ETH`);
        })
        .catch((err) => {
          console.error(`[FactoryService] Error fetching factory signer balance: ${err.message}`);
        });
    } else {
      console.warn(`[FactoryService] Factory signer does NOT have a provider.`);
    }
  } catch (e) {
    console.error(`[FactoryService] Error creating factory signer from private key: ${e.message}`);
    factorySigner = null; // Ensure it's null if creation fails
  }
} else {
  console.warn("[FactoryService] FACTORY_DEPLOYER_PRIVATE_KEY not found in .env. Factory operations will fail.");
}

let factoryAbi;
let factoryAddress;
let factoryContract;

// Wrap the initialization logic in an async IIFE to allow await
(async () => {
  try {
    const abiPath = path.join(__dirname, "..", "contractsData", "LoyaltyProgramFactory_ABI.json");
    const deployedPath = path.join(__dirname, "..", "contractsData", "deployedFactories.json");

    console.log(`[FactoryService] Checking for ABI at: ${abiPath}`);
    console.log(`[FactoryService] Checking for deployed data at: ${deployedPath}`);

    if (fs.existsSync(abiPath) && fs.existsSync(deployedPath)) {
      factoryAbi = JSON.parse(fs.readFileSync(abiPath));
      const deployedData = JSON.parse(fs.readFileSync(deployedPath));
      factoryAddress = deployedData.address;

      console.log(`[FactoryService] Factory ABI loaded: ${factoryAbi ? "Yes" : "No"}`);
      console.log(`[FactoryService] Factory Address from file: ${factoryAddress}`);
      console.log(`[FactoryService] Factory Signer status: ${factorySigner ? "Initialized" : "Not Initialized"}`);

      if (factoryAddress && factoryAbi && factorySigner) {
        // NEW: Wait for the signer's provider to be ready before creating the contract instance
        if (factorySigner.provider) {
          console.log("[FactoryService] Waiting for factory signer's provider to be ready...");
          await factorySigner.provider.ready; // Ensure provider is connected
          console.log("[FactoryService] Factory signer's provider is ready.");
        } else {
          console.warn("[FactoryService] Factory signer has no provider, skipping provider.ready check.");
        }

        factoryContract = new ethers.Contract(factoryAddress, factoryAbi, factorySigner);
        console.log("[FactoryService] LoyaltyProgramFactory contract instance created successfully.");
      } else {
        console.warn("[FactoryService] Factory contract not fully initialized. One or more dependencies are missing:");
        if (!factoryAddress) console.warn("  - factoryAddress is missing or invalid.");
        if (!factoryAbi) console.warn("  - factoryAbi is missing or invalid.");
        if (!factorySigner) console.warn("  - factorySigner is not initialized (check FACTORY_DEPLOYER_PRIVATE_KEY).");
      }
    } else {
      console.warn(
        "[FactoryService] LoyaltyProgramFactory ABI or deployedFactories.json not found. Deploy the factory contract first."
      );
      if (!fs.existsSync(abiPath)) console.warn(`  - Missing ABI file: ${abiPath}`);
      if (!fs.existsSync(deployedPath)) console.warn(`  - Missing deployed data file: ${deployedPath}`);
    }
  } catch (error) {
    console.error("[FactoryService] Error loading LoyaltyProgramFactory during initialization:", error);
  }
})(); // Immediately Invoked Function Expression

async function deployLoyaltyTokenViaFactory(businessId, tokenName, tokenSymbol, tokenDecimals, businessOwnerAddress) {
  // NEW LOG: Check factoryContract status right before attempting to use it
  console.log(
    `[FactoryService] deployLoyaltyTokenViaFactory called. Current factoryContract status: ${
      factoryContract ? "Initialized" : "Null/Undefined"
    }`
  );

  if (!factoryContract) {
    console.error("[FactoryService] Attempted to deploy but factoryContract is null.");
    throw new Error("LoyaltyProgramFactory contract is not initialized. Deploy it first.");
  }
  if (!ethers.isAddress(businessOwnerAddress)) {
    throw new Error("Invalid business owner address format.");
  }

  let tx; // Declare tx outside the inner try-catch
  try {
    console.log(`[FactoryService] Calling factory to deploy program for businessId: ${businessId}`);
    console.log(
      `[FactoryService] Type of factoryContract.deployLoyaltyProgram: ${typeof factoryContract.deployLoyaltyProgram}`
    );
    console.log(
      `[FactoryService] Value of factoryContract.deployLoyaltyProgram: ${factoryContract.deployLoyaltyProgram}`
    );

    // NEW LOGS: Log the exact arguments being passed
    console.log(`[FactoryService] Arguments for deployLoyaltyProgram:`);
    console.log(`  - businessId: ${businessId} (Type: ${typeof businessId})`);
    console.log(`  - tokenName: ${tokenName} (Type: ${typeof tokenName})`);
    console.log(`  - tokenSymbol: ${tokenSymbol} (Type: ${typeof tokenSymbol})`);
    console.log(`  - tokenDecimals: ${tokenDecimals} (Type: ${typeof tokenDecimals})`);
    console.log(`  - businessOwnerAddress: ${businessOwnerAddress} (Type: ${typeof businessOwnerAddress})`);

    if (typeof factoryContract.deployLoyaltyProgram !== "function") {
      console.error(`[FactoryService] deployLoyaltyProgram is not a function on factoryContract. ABI mismatch?`);
      throw new Error(
        "Contract method 'deployLoyaltyProgram' not found on ABI. ABI mismatch or contract not properly loaded."
      );
    }

    // NEW: More granular try-catch for the contract call
    try {
      tx = await factoryContract.deployLoyaltyProgram(
        businessId,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        businessOwnerAddress
      );
      console.log(`[FactoryService] Transaction object received:`, tx); // This line will only be reached if tx is not undefined
    } catch (contractCallError) {
      console.error("[FactoryService] Error during contract call to deployLoyaltyProgram:", contractCallError);
      // Re-throw to be caught by the outer catch block
      throw contractCallError;
    }

    const receipt = await tx.wait();
    console.log(`[FactoryService] Loyalty program deployment transaction successful. Tx hash: ${receipt.hash}`);

    // Get the deployed token address from the event
    const iface = new ethers.Interface(factoryAbi);
    let deployedTokenAddress = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);
        if (parsedLog && parsedLog.name === "LoyaltyProgramDeployed") {
          deployedTokenAddress = parsedLog.args.tokenAddress;
          break;
        }
      } catch (e) {
        // Not a log we care about, ignore
      }
    }

    if (!deployedTokenAddress) {
      throw new Error("Could not find LoyaltyProgramDeployed event in transaction receipt.");
    }

    return {
      contractAddress: deployedTokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
      owner: businessOwnerAddress,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    // This is the outer catch block
    console.error(
      "[FactoryService] Error deploying loyalty token via factory (outer catch):",
      error.reason || error.message,
      error
    );
    throw new Error(`Failed to deploy loyalty program via factory: ${error.reason || error.message}`);
  }
}

async function getLoyaltyProgramDetailsFromFactory(businessId) {
  if (!factoryContract) {
    throw new Error("LoyaltyProgramFactory contract is not initialized.");
  }
  try {
    const factoryContractView = new ethers.Contract(factoryAddress, factoryAbi, provider);
    const [tokenAddress, name, symbol, ownerAddress] = await factoryContractView.getLoyaltyProgramDetails(businessId);
    return { tokenAddress, name, symbol, ownerAddress };
  } catch (error) {
    console.error(`[FactoryService] Error fetching program details from factory for ${businessId}:`, error.message);
    throw new Error(`Failed to fetch program details from factory: ${error.message}`);
  }
}

async function getAllDeployedBusinessIdsFromFactory() {
  if (!factoryContract) {
    throw new Error("LoyaltyProgramFactory contract is not initialized.");
  }
  try {
    const factoryContractView = new ethers.Contract(factoryAddress, factoryAbi, provider);
    const ids = await factoryContractView.getAllBusinessIds();
    return ids;
  } catch (error) {
    console.error("[FactoryService] Error fetching all business IDs from factory:", error.message);
    throw new Error(`Failed to fetch all business IDs from factory: ${error.message}`);
  }
}

module.exports = {
  deployLoyaltyTokenViaFactory,
  getLoyaltyProgramDetailsFromFactory,
  getAllDeployedBusinessIdsFromFactory,
  factorySigner, // Export for debugging/info
};
