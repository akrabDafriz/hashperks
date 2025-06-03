// backend/services/authService.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // For generating IDs

const usersFilePath = path.join(__dirname, "../data/users.json");
const businessesFilePath = path.join(__dirname, "../data/businesses.json");

let users = [];
let businesses = [];

function loadData() {
  try {
    if (fs.existsSync(usersFilePath)) {
      users = JSON.parse(fs.readFileSync(usersFilePath));
      console.log(`Loaded ${users.length} users.`);
    } else {
      fs.writeFileSync(usersFilePath, JSON.stringify([]));
    }
    if (fs.existsSync(businessesFilePath)) {
      businesses = JSON.parse(fs.readFileSync(businessesFilePath));
      console.log(`Loaded ${businesses.length} businesses.`);
    } else {
      fs.writeFileSync(businessesFilePath, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error loading auth data:", error);
    users = [];
    businesses = [];
  }
}

function saveData() {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    fs.writeFileSync(businessesFilePath, JSON.stringify(businesses, null, 2));
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
}

// Load data on service start
loadData();

// --- User Management ---
function registerUser(username, password, walletAddress) {
  if (users.some((u) => u.username === username)) {
    throw new Error("Username already exists.");
  }
  if (users.some((u) => u.walletAddress === walletAddress)) {
    throw new Error("Wallet address already registered.");
  }
  const newUser = {
    id: crypto.randomUUID(),
    username,
    password, // In production, hash this password!
    walletAddress,
    subscribedPrograms: [], // Store subscribed programs (backend-managed)
  };
  users.push(newUser);
  saveData();
  return { id: newUser.id, username: newUser.username, walletAddress: newUser.walletAddress };
}

function loginUser(username, password) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    throw new Error("Invalid username or password.");
  }
  return { id: user.id, username: user.username, walletAddress: user.walletAddress };
}

function getUserById(id) {
  return users.find((u) => u.id === id);
}

function getUserByWalletAddress(walletAddress) {
  return users.find((u) => u.walletAddress === walletAddress);
}

function subscribeUserToProgram(userId, businessId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  if (!user.subscribedPrograms.includes(businessId)) {
    user.subscribedPrograms.push(businessId);
    saveData();
    return true;
  }
  return false; // Already subscribed
}

// --- Business Management ---
function registerBusiness(name, email, password, ownerWalletAddress) {
  if (businesses.some((b) => b.email === email)) {
    throw new Error("Business email already exists.");
  }
  const newBusiness = {
    id: crypto.randomUUID(), // Unique ID for the business
    name,
    email,
    password, // In production, hash this password!
    ownerWalletAddress, // The wallet address that will own the deployed contract
    loyaltyProgram: null, // Will store { businessId, contractAddress } after deployment
  };
  businesses.push(newBusiness);
  saveData();
  return {
    id: newBusiness.id,
    name: newBusiness.name,
    email: newBusiness.email,
    ownerWalletAddress: newBusiness.ownerWalletAddress,
  };
}

function loginBusiness(email, password) {
  const business = businesses.find((b) => b.email === email && b.password === password);
  if (!business) {
    throw new Error("Invalid email or password.");
  }
  return {
    id: business.id,
    name: business.name,
    email: business.email,
    ownerWalletAddress: business.ownerWalletAddress,
    loyaltyProgram: business.loyaltyProgram,
  };
}

function getBusinessById(id) {
  return businesses.find((b) => b.id === id);
}

function updateBusinessLoyaltyProgram(businessId, programDetails) {
  const business = getBusinessById(businessId);
  if (!business) {
    throw new Error("Business not found.");
  }
  business.loyaltyProgram = programDetails; // { businessId: '...', contractAddress: '...', name: '...', symbol: '...' }
  saveData();
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUserByWalletAddress,
  subscribeUserToProgram,
  registerBusiness,
  loginBusiness,
  getBusinessById,
  updateBusinessLoyaltyProgram,
  loadData,
};
