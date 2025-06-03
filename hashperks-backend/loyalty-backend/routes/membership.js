const express = require('express');
const router = express.Router({ mergeParams: true });
const membershipController = require('../controllers/membershipController');

const authenticateToken = require('../middleware/authMiddleware');

router.post('/:id/membership', authenticateToken, membershipController.joinMembership);
router.get('/', membershipController.listMembershipsForStore);
// router.get('/membership', authenticateToken, membershipController.listStoreForMembership);

module.exports = router;
