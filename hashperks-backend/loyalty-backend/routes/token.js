const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/:user_id', authenticateToken, tokenController.getBalance);

module.exports = router;
