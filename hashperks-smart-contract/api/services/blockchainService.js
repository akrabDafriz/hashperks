const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const businessService = require("./businessService");

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

let backendSigner;
if (process.env.BACKEND_WALLET_PRIVATE_KEY) {
  backendSigner = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider);
  console.log(`Backend signer configured with address: ${backendSigner.address}`);
} else {
  console.warn(
    "BACKEND_WALLET_PRIVATE_KEY not found in .env. Operations requiring signing by backend (like issuePoints) will fail."
  );
}

let loyaltyTokenAbi;
try {
  const abiPath = path.join(__dirname, "..", "contractsData", "LoyaltyToken_ABI.json");
  if (fs.existsSync(abiPath)) {
    loyaltyTokenAbi = JSON.parse(fs.readFileSync(abiPath));
    console.log("LoyaltyToken ABI loaded.");
  } else {
    throw new Error("LoyaltyToken_ABI.json not found. Make sure to compile and deploy contracts first.");
  }
} catch (error) {
  console.error("Error loading LoyaltyToken ABI:", error);

  loyaltyTokenAbi = null;
}

function getLoyaltyContractInstance(businessId, signerOrProvider = provider) {
  if (!loyaltyTokenAbi) {
    throw new Error("LoyaltyToken ABI not loaded.");
  }
  const contractAddress = businessService.getContractAddress(businessId);
  if (!contractAddress) {
    throw new Error(`Contract address for business ID '${businessId}' not found.`);
  }
  return new ethers.Contract(contractAddress, loyaltyTokenAbi, signerOrProvider);
}

async function issuePointsToCustomer(businessId, customerAddress, amount) {
  if (!backendSigner) {
    throw new Error("Backend wallet not configured. Cannot issue points.");
  }
  if (!ethers.isAddress(customerAddress)) {
    throw new Error("Invalid customer address format.");
  }
  const pointsAmount = parseInt(amount);
  if (isNaN(pointsAmount) || pointsAmount <= 0) {
    throw new Error("Amount must be a positive integer.");
  }

  const contract = getLoyaltyContractInstance(businessId, backendSigner);
  try {
    const tx = await contract.issuePoints(customerAddress, pointsAmount);
    await tx.wait();
    console.log(`Issued ${pointsAmount} points to ${customerAddress} for business ${businessId}. Tx: ${tx.hash}`);
    return { success: true, transactionHash: tx.hash, customerAddress, amount: pointsAmount };
  } catch (error) {
    console.error(
      `Error issuing points for business ${businessId} to ${customerAddress}:`,
      error.reason || error.message
    );
    throw new Error(`Failed to issue points: ${error.reason || error.message}`);
  }
}

async function getCustomerBalance(businessId, customerAddress) {
  if (!ethers.isAddress(customerAddress)) {
    throw new Error("Invalid customer address format.");
  }
  const contract = getLoyaltyContractInstance(businessId);
  try {
    const balance = await contract.balanceOf(customerAddress);
    const businessDetails = businessService.getBusinessDetails(businessId);
    return {
      customerAddress,
      businessId,
      businessName: businessDetails?.name || businessId,
      tokenSymbol: businessDetails?.symbol || "POINTS",
      balance: balance.toString(),
    };
  } catch (error) {
    console.error(`Error fetching balance for ${customerAddress} at business ${businessId}:`, error.message);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

async function redeemPointsByCustomer(businessId, customerSigner, amount) {
  if (!customerSigner) throw new Error("Customer signer is required for redemption.");

  const pointsAmount = parseInt(amount);
  if (isNaN(pointsAmount) || pointsAmount <= 0) {
    throw new Error("Amount must be a positive integer.");
  }

  const contract = getLoyaltyContractInstance(businessId, customerSigner);
  try {
    const tx = await contract.redeemPoints(pointsAmount);
    await tx.wait();
    const customerAddress = await customerSigner.getAddress();
    console.log(
      `Customer ${customerAddress} redeemed ${pointsAmount} points from business ${businessId}. Tx: ${tx.hash}`
    );
    return { success: true, transactionHash: tx.hash, customerAddress, amount: pointsAmount };
  } catch (error) {
    console.error(`Error redeeming points for customer at business ${businessId}:`, error.reason || error.message);
    throw new Error(`Failed to redeem points: ${error.reason || error.message}`);
  }
}

async function getContractGeneralInfo(businessId) {
  const contract = getLoyaltyContractInstance(businessId);
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    return {
      address: contract.target,
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      owner,
    };
  } catch (error) {
    console.error(`Error fetching contract info for business ${businessId}:`, error.message);
    throw new Error(`Could not fetch contract info: ${error.message}`);
  }
}

module.exports = {
  issuePointsToCustomer,
  getCustomerBalance,
  redeemPointsByCustomer,
  getContractGeneralInfo,
  provider,
  backendSigner,
};
