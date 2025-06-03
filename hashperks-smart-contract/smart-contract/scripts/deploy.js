const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy LoyaltyProgramFactory
  const LoyaltyProgramFactory = await hre.ethers.getContractFactory("LoyaltyProgramFactory");
  const factory = await LoyaltyProgramFactory.deploy(deployer.address); // Factory owner is the deployer
  await factory.waitForDeployment();
  console.log("LoyaltyProgramFactory deployed to:", factory.target);

  // Save Factory ABI and address
  const factoryAbiPath = path.join(__dirname, "../../api/contractsData/LoyaltyProgramFactory_ABI.json");
  const factoryArtifact = await hre.artifacts.readArtifact("LoyaltyProgramFactory");
  fs.writeFileSync(factoryAbiPath, JSON.stringify(factoryArtifact.abi, null, 2));
  console.log("LoyaltyProgramFactory ABI saved to:", factoryAbiPath);

  const deployedFactoriesPath = path.join(__dirname, "../../api/contractsData/deployedFactories.json");
  const deployedFactories = {
    address: factory.target,
    owner: deployer.address,
  };
  fs.writeFileSync(deployedFactoriesPath, JSON.stringify(deployedFactories, null, 2));
  console.log("LoyaltyProgramFactory address saved to:", deployedFactoriesPath);

  // Deploy a default LoyaltyToken using the factory
  const defaultBusinessId = "DefaultBusinessToken";
  const defaultTokenName = "Default Business Token";
  const defaultTokenSymbol = "DBT";
  const defaultTokenDecimals = 0;
  const defaultBusinessOwnerAddress = deployer.address; // The deployer will also own this default token

  console.log(`\nDeploying default LoyaltyToken for business ID: ${defaultBusinessId}`);
  const tx = await factory.deployLoyaltyProgram(
    defaultBusinessId,
    defaultTokenName,
    defaultTokenSymbol,
    defaultTokenDecimals,
    defaultBusinessOwnerAddress
  );
  await tx.wait(); // Wait for the transaction to be mined

  const [tokenAddress, name, symbol, ownerAddress] = await factory.getLoyaltyProgramDetails(defaultBusinessId);
  console.log(`Default LoyaltyToken deployed at: ${tokenAddress}`);
  console.log(`Default LoyaltyToken owner: ${ownerAddress}`);

  // Save LoyaltyToken ABI (still needed for direct interaction)
  const loyaltyTokenAbiPath = path.join(__dirname, "../../api/contractsData/LoyaltyToken_ABI.json");
  const loyaltyTokenArtifact = await hre.artifacts.readArtifact("LoyaltyToken");
  fs.writeFileSync(loyaltyTokenAbiPath, JSON.stringify(loyaltyTokenArtifact.abi, null, 2));
  console.log("LoyaltyToken ABI saved to:", loyaltyTokenAbiPath);

  // Update businessContracts.json to reflect the new factory-deployed token
  const businessContractsPath = path.join(__dirname, "../../api/contractsData/businessContracts.json");
  let businessContracts = {};
  if (fs.existsSync(businessContractsPath)) {
    businessContracts = JSON.parse(fs.readFileSync(businessContractsPath));
  }

  businessContracts[defaultBusinessId] = {
    address: tokenAddress,
    name: name,
    symbol: symbol,
    owner: ownerAddress,
  };

  fs.writeFileSync(businessContractsPath, JSON.stringify(businessContracts, null, 2));
  console.log("Default business contract details saved to:", businessContractsPath);

  // Also copy LoyaltyToken_ABI.json to frontend/public
  const frontendAbiPath = path.join(__dirname, "../../frontend/public/LoyaltyToken_ABI.json");
  fs.copyFileSync(loyaltyTokenAbiPath, frontendAbiPath);
  console.log("LoyaltyToken ABI copied to frontend/public.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
