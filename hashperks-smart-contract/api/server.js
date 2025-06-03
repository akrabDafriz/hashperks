// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api"); // Existing loyalty API routes
const authRoutes = require("./routes/auth"); // NEW auth routes
const businessRoutes = require("./routes/business"); // NEW business routes
const userRoutes = require("./routes/user"); // NEW user routes
const businessService = require("./services/businessService"); // To load business data on start
const authService = require("./services/authService"); // To load auth data on start

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Initialize services that need to load data on start
businessService.loadBusinessContracts(); // Load existing business-contract mappings
authService.loadData(); // Load users and businesses data

// API Routes
app.use("/api/v1", apiRoutes); // Existing loyalty routes
app.use("/api/v1/auth", authRoutes); // NEW auth routes
app.use("/api/v1/business", businessRoutes); // NEW business routes
app.use("/api/v1/user", userRoutes); // NEW user routes

// Simple root route
app.get("/", (req, res) => {
  res.send("HashPerks API Server is running!");
});

// Not Found Handler (should be after all routes)
app.use((req, res, next) => {
  res
    .status(404)
    .json({ error: "Not Found", message: `The requested URL ${req.originalUrl} was not found on this server.` });
});

// Global Error Handler (must have 4 arguments: err, req, res, next)
app.use((err, req, res, next) => {
  console.error("Global error handler caught an error:", err.stack || err.message || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  if (!process.env.BACKEND_WALLET_PRIVATE_KEY) {
    console.warn(
      "Warning: BACKEND_WALLET_PRIVATE_KEY is not set in backend/.env. Operations requiring signing by the backend will fail."
    );
  }
  if (!process.env.FACTORY_DEPLOYER_PRIVATE_KEY) {
    console.warn("Warning: FACTORY_DEPLOYER_PRIVATE_KEY is not set in backend/.env. Factory operations will fail.");
  }
  if (!process.env.BLOCKCHAIN_RPC_URL) {
    console.warn("Warning: BLOCKCHAIN_RPC_URL is not set in backend/.env. Blockchain interactions will fail.");
  }
});
