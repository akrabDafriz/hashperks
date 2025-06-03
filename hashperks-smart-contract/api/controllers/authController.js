// backend/controllers/authController.js
const authService = require("../services/authService");

exports.registerUser = (req, res, next) => {
  const { username, password, walletAddress } = req.body;
  try {
    const user = authService.registerUser(username, password, walletAddress);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = authService.loginUser(username, password);
    res.json({ message: "User logged in successfully", user });
  } catch (error) {
    next(error);
  }
};

exports.registerBusiness = (req, res, next) => {
  const { name, email, password, ownerWalletAddress } = req.body;
  try {
    const business = authService.registerBusiness(name, email, password, ownerWalletAddress);
    res.status(201).json({ message: "Business registered successfully", business });
  } catch (error) {
    next(error);
  }
};

exports.loginBusiness = (req, res, next) => {
  const { email, password } = req.body;
  try {
    const business = authService.loginBusiness(email, password);
    res.json({ message: "Business logged in successfully", business });
  } catch (error) {
    next(error);
  }
};
