// backend/services/businessService.js
const fs = require("fs");
const path = require("path");

const businessContractsPath = path.join(__dirname, "..", "contractsData", "businessContracts.json");
let businessContractMappings = {};

function loadBusinessContracts() {
  try {
    if (fs.existsSync(businessContractsPath)) {
      const rawData = fs.readFileSync(businessContractsPath);
      businessContractMappings = JSON.parse(rawData);
      console.log("Business contract mappings loaded.");
    } else {
      console.warn("businessContracts.json not found. Creating empty file.");
      fs.writeFileSync(businessContractsPath, JSON.stringify({}, null, 2));
      businessContractMappings = {};
    }
  } catch (error) {
    console.error("Error loading business contract mappings:", error);
    businessContractMappings = {}; // Reset to empty on error
  }
}

// Load mappings when the service starts
loadBusinessContracts();

function getContractAddress(businessId) {
  return businessContractMappings[businessId]?.address;
}

function getBusinessDetails(businessId) {
  return businessContractMappings[businessId];
}

function getAllBusinesses() {
  return businessContractMappings;
}

// NEW FUNCTION: Add or update a business contract mapping
function addOrUpdateBusinessContract(businessId, contractDetails) {
  businessContractMappings[businessId] = contractDetails;
  try {
    fs.writeFileSync(businessContractsPath, JSON.stringify(businessContractMappings, null, 2));
    console.log(`Business contract mapping for ${businessId} updated/added.`);
  } catch (error) {
    console.error(`Error saving business contract mapping for ${businessId}:`, error);
  }
}

module.exports = {
  loadBusinessContracts,
  getContractAddress,
  getBusinessDetails,
  getAllBusinesses,
  addOrUpdateBusinessContract, // Export the new function
};
