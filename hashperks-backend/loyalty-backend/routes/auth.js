const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {authenticateToken} = require('../middleware/authMiddleware');

// Tanpa autentikasi
router.post('/register', authController.register);
router.post('/login', authController.login);

// Hanya user login yang bisa akses
router.get('/:id', authenticateToken, authController.getAccount);
router.put('/:id', authenticateToken, authController.updateAccount);
router.delete('/:id', authenticateToken, authController.deleteAccount);

module.exports = router;