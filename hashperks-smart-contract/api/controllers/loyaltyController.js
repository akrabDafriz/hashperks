const blockchainService = require("../services/blockchainService");
const businessService = require("../services/businessService");
const { ethers } = require("ethers"); // For wallet creation in redeem (example only)

exports.listBusinesses = (req, res, next) => {
  try {
    const businesses = businessService.getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    next(error);
  }
};

exports.getBusinessContractInfo = async (req, res, next) => {
  const { businessId } = req.params;
  if (!businessId) {
    return res.status(400).json({ error: "businessId parameter is required." });
  }
  try {
    const contractAddress = businessService.getContractAddress(businessId);
    if (!contractAddress) {
      return res.status(404).json({ error: `Business ID '${businessId}' not found or no contract associated.` });
    }
    const info = await blockchainService.getContractGeneralInfo(businessId);
    res.json(info);
  } catch (error) {
    next(error);
  }
};

exports.issuePoints = async (req, res, next) => {
  const { businessId } = req.params;
  const { customerAddress, amount } = req.body;

  if (!businessId || !customerAddress || amount === undefined) {
    return res.status(400).json({ error: "businessId (param), customerAddress, and amount (body) are required." });
  }
  try {
    const result = await blockchainService.issuePointsToCustomer(businessId, customerAddress, amount);
    res.json({ message: "Points issued successfully", ...result });
  } catch (error) {
    console.error("Error in issuePoints controller:", error.message);
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  const { businessId, customerAddress } = req.params;
  if (!businessId || !customerAddress) {
    return res.status(400).json({ error: "businessId and customerAddress parameters are required." });
  }
  try {
    const balanceData = await blockchainService.getCustomerBalance(businessId, customerAddress);
    res.json(balanceData);
  } catch (error) {
    next(error);
  }
};

// REDEMPTION - SIMPLIFIED FOR TESTING (Customer should sign on frontend)
exports.redeemPoints = async (req, res, next) => {
  const { businessId } = req.params;
  // DANGER ZONE: Never accept private keys from a client in a real application.
  // This is purely for a simplified backend-driven test of the redeem function.
  const { customerPrivateKey, amount } = req.body;

  if (!businessId || !customerPrivateKey || amount === undefined) {
    return res.status(400).json({
      error: "businessId (param), customerPrivateKey, and amount (body) are required for this test endpoint.",
    });
  }
  if (parseInt(amount) <= 0) {
    return res.status(400).json({ error: "Amount must be positive." });
  }

  try {
    // Create a temporary signer from the provided private key FOR TESTING ONLY.
    const customerSigner = new ethers.Wallet(customerPrivateKey, blockchainService.provider);
    const result = await blockchainService.redeemPointsByCustomer(businessId, customerSigner, amount);
    res.json({ message: "Points redeemed successfully (via test endpoint)", ...result });
  } catch (error) {
    console.error("Error in redeemPoints controller:", error.message);
    next(error);
  }
};
