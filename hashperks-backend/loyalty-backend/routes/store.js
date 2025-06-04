const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Assuming authorizeRole middleware

router.get('/my-store', authenticateToken, authorizeRole(['store_owner']), storeController.getMyStore);
router.get('/', storeController.getAllStores); 
router.post('/', authenticateToken, authorizeRole(['store_owner']), storeController.createStore);
router.get('/:id', storeController.getStoreById); // Public or protected
router.put('/:id', authenticateToken, authorizeRole(['store_owner']), storeController.updateStore);
router.delete('/:id', authenticateToken, authorizeRole(['store_owner']), storeController.deleteStore);


module.exports = router;