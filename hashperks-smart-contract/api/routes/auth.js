// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register/user", authController.registerUser);
router.post("/login/user", authController.loginUser);
router.post("/register/business", authController.registerBusiness);
router.post("/login/business", authController.loginBusiness);

module.exports = router;
