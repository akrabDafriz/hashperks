// In hashperks-backend/loyalty-backend/routes/membership.js
const express = require('express');
// mergeParams: true is essential here so this router can access :id (storeId) 
// from the parent route in index.js (e.g., /api/store/:id/membership)
const router = express.Router({ mergeParams: true }); 

const membershipController = require('../controllers/membershipController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, membershipController.joinMembership);
router.get('/', authenticateToken, authorizeRole(['store_owner', 'admin']), membershipController.listMembershipsForStore);

module.exports = router;
