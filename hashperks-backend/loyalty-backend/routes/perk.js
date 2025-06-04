// In hashperks-backend/loyalty-backend/routes/perk.js
const express = require('express');
const router = express.Router();
const perkController = require('../controllers/perkController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// GET perks for a specific loyalty program
// This can be public or authenticated depending on whether non-members can see perks.
// For now, let's make it authenticated.
router.get('/program/:loyaltyProgramId/list', authenticateToken, perkController.listPerksForProgram);

// POST create a new perk for a specific loyalty program (store owner only)
router.post('/program/:loyaltyProgramId/create', authenticateToken, authorizeRole(['store_owner']), perkController.createPerk);

module.exports = router;
