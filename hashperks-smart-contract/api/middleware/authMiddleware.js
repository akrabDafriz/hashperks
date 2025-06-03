// backend/middleware/authMiddleware.js
const authService = require("../services/authService");

const authenticateUser = (req, res, next) => {
  const userId = req.headers["x-user-id"]; // Simple header-based auth for this example
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized", message: "User ID missing in headers." });
  }
  const user = authService.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid User ID." });
  }
  req.user = user; // Attach user object to request
  next();
};

const authenticateBusiness = (req, res, next) => {
  const businessId = req.headers["x-business-id"]; // Simple header-based auth for this example
  if (!businessId) {
    return res.status(401).json({ error: "Unauthorized", message: "Business ID missing in headers." });
  }
  const business = authService.getBusinessById(businessId);
  if (!business) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid Business ID." });
  }
  req.business = business; // Attach business object to request
  next();
};

module.exports = {
  authenticateUser,
  authenticateBusiness,
};
