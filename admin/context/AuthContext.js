"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchUser, loginUser, logoutUser } from "@/utils/api"; // Import API functions

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);

  // Helper function to update authentication states
  // Can set to authenticated state (true, isAdmin, username) or unauthenticated (false, false, null)
  const updateAuthState = (loggedIn, adminStatus, usernameValue) => {
    setIsLoggedIn(loggedIn);
    setIsAdmin(adminStatus);
    setUsername(usernameValue);
  };

  // Initial auth check - only runs once on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userResponse = await fetchUser();

        if (!userResponse.ok) {
          // Clear auth state if not authenticated
          updateAuthState(false, false, null);
          if (userResponse.status !== 401) {
            // Only set error for non-401 responses
            setError("An error occurred while checking login status.");
          }
          return;
        }

        const userData = await userResponse.json();
        updateAuthState(true, userData.isAdmin, userData.username);
      } catch (err) {
        console.error("Error during authentication check:", err);
        updateAuthState(false, false, null);
        setError("An error occurred during authentication check.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await loginUser(username, password);

      if (!response.ok) {
        const errorMsg =
          response.error || response.data?.message || "Login failed";
        setError(errorMsg);
        updateAuthState(false, false, null);
        return false;
      }

      updateAuthState(
        true,
        response.data.user.isAdmin,
        response.data.user.username
      );
      return true;
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred during login.");
      updateAuthState(false, false, null);
      return false;
    }
  };

  const logout = async () => {
    if (!isLoggedIn) return true; // Don't attempt logout if not logged in

    setError(null);
    try {
      const response = await logoutUser();

      if (!response.ok) {
        console.error("Logout failed", response.status);
        setError("Logout failed.");
        return false;
      }

      updateAuthState(false, false, null);
      console.log("Logged out successfully");
      return true;
    } catch (err) {
      console.error("Error during logout:", err);
      setError("An error occurred during logout.");
      updateAuthState(false, false, null);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAdmin, loading, error, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
