const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


router.post('/', authenticateToken, transactionController.recordTransaction);
router.get('/store/:storeId', authenticateToken, authorizeRole(['store_owner']), transactionController.listTransactionsForStore);

module.exports = router;