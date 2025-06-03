// backend/routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Authenticated user routes
router.post("/programs/subscribe", authenticateUser, userController.subscribeToProgram);
router.get("/programs/subscribed", authenticateUser, userController.getUserSubscribedPrograms);

module.exports = router;
