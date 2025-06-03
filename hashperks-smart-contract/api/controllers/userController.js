// backend/controllers/userController.js
const authService = require("../services/authService");
const businessService = require("../services/businessService"); // To get all business details

exports.subscribeToProgram = (req, res, next) => {
  const { businessId } = req.user;
  const user = req.user; // Attached by authMiddleware

  if (!user) {
    return res.status(403).json({ error: "Forbidden", message: "User not authenticated." });
  }

  // Basic check if business exists
  const businessDetails = businessService.getBusinessDetails(businessId);
  if (!businessDetails) {
    return res.status(404).json({ error: "Not Found", message: "Business program not found." });
  }

  try {
    const subscribed = authService.subscribeUserToProgram(user.id, businessId);
    if (subscribed) {
      res.json({ message: `Successfully subscribed to ${businessDetails.name} program.` });
    } else {
      res.status(200).json({ message: `Already subscribed to ${businessDetails.name} program.` });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserSubscribedPrograms = (req, res, next) => {
  const user = req.user; // Attached by authMiddleware
  if (!user) {
    return res.status(403).json({ error: "Forbidden", message: "User not authenticated." });
  }

  const subscribedProgramsDetails = user.subscribedPrograms.map((businessId) => {
    const details = businessService.getBusinessDetails(businessId);
    return details ? { id: businessId, ...details } : { id: businessId, name: "Unknown Business", symbol: "N/A" };
  });

  res.json({ subscribedPrograms: subscribedProgramsDetails });
};

// You can add more user-specific endpoints here.
