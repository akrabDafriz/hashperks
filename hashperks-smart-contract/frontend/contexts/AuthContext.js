// frontend/contexts/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, loginBusiness, registerBusiness } from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // For user accounts
  const [business, setBusiness] = useState(null); // For business accounts
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load auth state from localStorage on mount
    const storedUser = localStorage.getItem("hashperks_user");
    const storedBusiness = localStorage.getItem("hashperks_business");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem("hashperks_user");
      }
    }
    if (storedBusiness) {
      try {
        setBusiness(JSON.parse(storedBusiness));
      } catch (e) {
        console.error("Failed to parse stored business data:", e);
        localStorage.removeItem("hashperks_business");
      }
    }
    setLoading(false);
  }, []);

  const handleUserLogin = async (username, password) => {
    setLoading(true);
    try {
      const userData = await loginUser(username, password);
      setUser(userData.user);
      setBusiness(null); // Ensure only one type of user is logged in
      localStorage.setItem("hashperks_user", JSON.stringify(userData.user));
      localStorage.removeItem("hashperks_business"); // Clear business if user logs in
      router.push("/user-dashboard");
      return { success: true };
    } catch (error) {
      console.error("User login failed:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async (username, password, walletAddress) => {
    setLoading(true);
    try {
      const userData = await registerUser(username, password, walletAddress);
      setUser(userData.user);
      setBusiness(null);
      localStorage.setItem("hashperks_user", JSON.stringify(userData.user));
      localStorage.removeItem("hashperks_business");
      router.push("/user-dashboard");
      return { success: true };
    } catch (error) {
      console.error("User registration failed:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessLogin = async (email, password) => {
    setLoading(true);
    try {
      const businessData = await loginBusiness(email, password);
      setBusiness(businessData.business);
      setUser(null); // Ensure only one type of user is logged in
      localStorage.setItem("hashperks_business", JSON.stringify(businessData.business));
      localStorage.removeItem("hashperks_user"); // Clear user if business logs in
      router.push("/business-dashboard");
      return { success: true };
    } catch (error) {
      console.error("Business login failed:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessRegister = async (name, email, password, ownerWalletAddress) => {
    setLoading(true);
    try {
      const businessData = await registerBusiness(name, email, password, ownerWalletAddress);
      setBusiness(businessData.business);
      setUser(null);
      localStorage.setItem("hashperks_business", JSON.stringify(businessData.business));
      localStorage.removeItem("hashperks_user");
      router.push("/business-dashboard");
      return { success: true };
    } catch (error) {
      console.error("Business registration failed:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setBusiness(null);
    localStorage.removeItem("hashperks_user");
    localStorage.removeItem("hashperks_business");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        handleUserLogin,
        handleUserRegister,
        handleBusinessLogin,
        handleBusinessRegister,
        logout,
        isAuthenticated: !!user || !!business,
        isUser: !!user,
        isBusiness: !!business,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
