const express = require("express");
const router = express.Router();
const loyaltyController = require("../controllers/loyaltyController");

// --- Business / Contract Info ---
// router.post('/businesses/register', loyaltyController.registerNewBusiness); // For programmatically registering
router.get("/businesses", loyaltyController.listBusinesses); // List all known businesses and their contracts
router.get("/businesses/:businessId/contract-info", loyaltyController.getBusinessContractInfo);

// --- Loyalty Point Operations ---
// Issue points (typically a business owner action, proxied by backend)
router.post("/businesses/:businessId/issue-points", loyaltyController.issuePoints);

// Get balance for a customer at a specific business
router.get("/businesses/:businessId/balance/:customerAddress", loyaltyController.getBalance);

// Redeem points (customer action, see controller/service notes on signing)
// This endpoint is for simplified testing where PK is provided.
router.post("/businesses/:businessId/redeem-points", loyaltyController.redeemPoints);

module.exports = router;
