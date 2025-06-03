const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');


router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/', storeController.createStore);
router.put('/:id', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);
router.get('/:id/loyalty', storeController.getLoyaltyProgramsByStore);

module.exports = router;