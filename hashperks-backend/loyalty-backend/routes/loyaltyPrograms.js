
const express = require('express');
const router = express.Router({ mergeParams: true }); 
const loyaltyProgramsController = require('../controllers/loyaltyProgramsController'); 
const loyaltyController = require('../controllers/loyaltyController'); 
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRole(['store_owner']), loyaltyProgramsController.createLoyaltyProgram);
router.get('/:lid', loyaltyController.getLoyaltyProgram); // Needs authenticateToken?
router.put('/:lid', authenticateToken, authorizeRole(['store_owner']), loyaltyController.updateLoyaltyProgram);
router.delete('/:lid', authenticateToken, authorizeRole(['store_owner']), loyaltyController.deleteLoyaltyProgram);

module.exports = router;
