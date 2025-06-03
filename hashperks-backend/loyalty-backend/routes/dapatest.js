const express = require('express');
const router = express.Router({ mergeParams: true });
const membershipController = require('../controllers/membershipController');

const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, membershipController.listStoreForMembership);

module.exports = router;
