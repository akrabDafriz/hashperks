// backend/routes/business.js
const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const { authenticateBusiness } = require("../middleware/authMiddleware");

// Authenticated business routes
router.post("/programs/create", authenticateBusiness, businessController.createLoyaltyProgram);
router.get("/programs/my", authenticateBusiness, businessController.getBusinessPrograms);

module.exports = router;
