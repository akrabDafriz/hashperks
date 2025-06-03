// frontend/services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function fetcher(url, options = {}) {
  // Ensure headers object exists
  options.headers = options.headers || {};

  // Ensure Content-Type is explicitly set to application/json
  // This will overwrite any existing Content-Type in options.headers
  options.headers["Content-Type"] = "application/json";

  // Ensure body is stringified if it's an object and not already a string
  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options, // Spread the options first
    headers: options.headers, // Then explicitly set headers to ensure Content-Type is applied
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
}

// --- Existing Loyalty API Calls ---
export async function getBusinesses() {
  return fetcher(`${API_BASE_URL}/businesses`);
}

export async function getBusinessContractInfo(businessId) {
  return fetcher(`${API_BASE_URL}/businesses/${businessId}/contract-info`);
}

export async function issuePoints(businessId, customerAddress, amount) {
  // This call needs to be authenticated by the backend as the business owner
  // In a real app, the backend would verify the caller's identity (e.g., via JWT)
  // before allowing them to issue points.
  // For this example, we assume the backend's internal logic handles the owner check.
  return fetcher(`${API_BASE_URL}/businesses/${businessId}/issue-points`, {
    method: "POST",
    body: { customerAddress, amount }, // Pass as object, fetcher will stringify
  });
}

export async function getCustomerBalance(businessId, customerAddress) {
  return fetcher(`${API_BASE_URL}/businesses/${businessId}/balance/${customerAddress}`);
}

export async function redeemPointsTest(businessId, customerPrivateKey, amount) {
  // DANGER: For testing only. Never send private keys in production.
  return fetcher(`${API_BASE_URL}/businesses/${businessId}/redeem-points`, {
    method: "POST",
    body: { customerPrivateKey, amount }, // Pass as object, fetcher will stringify
  });
}

// --- NEW Auth API Calls ---
export async function registerUser(username, password, walletAddress) {
  return fetcher(`${API_BASE_URL}/auth/register/user`, {
    method: "POST",
    body: { username, password, walletAddress }, // Pass as object
  });
}

export async function loginUser(username, password) {
  return fetcher(`${API_BASE_URL}/auth/login/user`, {
    method: "POST",
    body: { username, password }, // Pass as object
  });
}

export async function registerBusiness(name, email, password, ownerWalletAddress) {
  return fetcher(`${API_BASE_URL}/auth/register/business`, {
    method: "POST",
    body: { name, email, password, ownerWalletAddress }, // Pass as object
  });
}

export async function loginBusiness(email, password) {
  return fetcher(`${API_BASE_URL}/auth/login/business`, {
    method: "POST",
    body: { email, password }, // Pass as object
  });
}

// --- NEW Business API Calls (Authenticated) ---
export async function createLoyaltyProgram(businessId, name, symbol, decimals, token) {
  console.log("[API Service] Preparing to send:", { name, symbol, decimals }); // Frontend log
  return fetcher(`${API_BASE_URL}/business/programs/create`, {
    method: "POST",
    headers: {
      "X-Business-ID": token, // Pass business ID as auth token
    },
    body: { name, symbol, decimals }, // Pass as object, fetcher will stringify
  });
}

export async function getMyBusinessPrograms(token) {
  return fetcher(`${API_BASE_URL}/business/programs/my`, {
    headers: {
      "X-Business-ID": token,
    },
  });
}

// --- NEW User API Calls (Authenticated) ---
export async function subscribeToProgram(businessId, token) {
  return fetcher(`${API_BASE_URL}/user/programs/subscribe`, {
    method: "POST",
    headers: {
      "X-User-ID": token, // Pass user ID as auth token
    },
    body: { businessId }, // Pass as object
  });
}

export async function getUserSubscribedPrograms(token) {
  return fetcher(`${API_BASE_URL}/user/programs/subscribed`, {
    headers: {
      "X-User-ID": token,
    },
  });
}
