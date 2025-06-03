const express = require('express');
const router = express.Router({ mergeParams: true });
const loyaltyController = require('../controllers/loyaltyController');
const loyaltyProgramsController = require('../controllers/loyaltyProgramsController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/:id/loyalty', authenticateToken, loyaltyProgramsController.createLoyaltyProgram);
router.get('/:lid', loyaltyController.getLoyaltyProgram);
router.post('/', loyaltyController.createLoyaltyProgram);
router.put('/:lid', loyaltyController.updateLoyaltyProgram);
router.delete('/:lid', loyaltyController.deleteLoyaltyProgram);

module.exports = router;
