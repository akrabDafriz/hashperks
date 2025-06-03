// backend/controllers/businessController.js
const authService = require("../services/authService");
const factoryService = require("../services/factoryService");
const businessService = require("../services/businessService"); // To update the local mapping

exports.createLoyaltyProgram = async (req, res, next) => {
  // NEW LOGS: Log raw req.body and all headers
  console.log("[BusinessController] Received request body:", req.body);
  console.log("[BusinessController] Received request headers:", req.headers);
  // If you add a raw body parser, you can also log req.rawBody here
  // console.log('[BusinessController] Received raw body:', req.rawBody ? req.rawBody.toString() : 'No raw body');

  // NEW CHECK: Ensure req.body is not undefined or null before destructuring
  if (!req.body) {
    console.error(
      "[BusinessController] Request body is missing or empty. Ensure Content-Type is application/json and Express JSON middleware is correctly configured."
    );
    return res.status(400).json({
      error: "Bad Request",
      message: "Request body is missing or empty. Ensure Content-Type is application/json.",
    });
  }

  const { name, symbol, decimals } = req.body;
  const business = req.business; // Attached by authMiddleware

  if (!business) {
    return res.status(403).json({ error: "Forbidden", message: "Business not authenticated." });
  }
  // NEW CHECK: Prevent calling factory if business already has a program (based on backend data)
  // This provides a clearer error message from the backend before hitting the blockchain
  if (business.loyaltyProgram && business.loyaltyProgram.address) {
    return res
      .status(400)
      .json({ error: "Bad Request", message: "This business already has a loyalty program deployed." });
  }
  if (!business.ownerWalletAddress) {
    return res.status(400).json({ error: "Bad Request", message: "Business owner wallet address is not set." });
  }

  // NEW CHECK: Ensure name, symbol, decimals are not undefined/null from req.body
  if (!name || !symbol || decimals === undefined || isNaN(parseInt(decimals))) {
    console.error("[BusinessController] Missing or invalid program details in request body:", {
      name,
      symbol,
      decimals,
    });
    return res
      .status(400)
      .json({ error: "Bad Request", message: "Missing or invalid program name, symbol, or decimals." });
  }

  try {
    // Use the business's unique ID as the _businessId for the factory
    const programDetails = await factoryService.deployLoyaltyTokenViaFactory(
      business.id, // Use the unique backend business ID
      name,
      symbol,
      parseInt(decimals), // Ensure decimals is parsed to an integer
      business.ownerWalletAddress
    );

    // Update the business record in our local data store with the new program details
    authService.updateBusinessLoyaltyProgram(business.id, {
      businessId: business.id,
      address: programDetails.contractAddress,
      name: programDetails.name,
      symbol: programDetails.symbol,
      owner: programDetails.owner,
    });

    // Also update the businessService's in-memory map and JSON file
    // This is crucial for existing loyaltyController/service to find the contract
    businessService.addOrUpdateBusinessContract(business.id, {
      address: programDetails.contractAddress,
      name: programName, // Use name from request body
      symbol: programSymbol, // Use symbol from request body
      owner: programDetails.owner,
    });

    res.status(201).json({ message: "Loyalty program created and deployed successfully", program: programDetails });
  } catch (error) {
    console.error("Error in createLoyaltyProgram controller:", error);
    next(error);
  }
};

exports.getBusinessPrograms = (req, res, next) => {
  const business = req.business; // Attached by authMiddleware
  if (!business) {
    return res.status(403).json({ error: "Forbidden", message: "Business not authenticated." });
  }
  res.json({ program: business.loyaltyProgram });
};

// You can add more business-specific endpoints here, e.g., view transactions for their program.
