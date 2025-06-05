"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, api }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);

  // Helper function to update authentication states
  const updateAuthState = (loggedIn, adminStatus, usernameValue) => {
    setIsLoggedIn(loggedIn);
    setIsAdmin(adminStatus);
    setUsername(usernameValue);
  };

  // Initial auth check - only runs once on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userResponse = await api.fetchUser();

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
  }, [api]);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.loginUser(username, password);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const userData = await response.json();
      updateAuthState(true, userData.user.isAdmin, userData.user.username);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await api.logoutUser();

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Logout failed");
      }

      updateAuthState(false, false, null);
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || "An error occurred during logout");
      return false;
    }
  };

  const value = {
    isLoggedIn,
    isAdmin,
    username,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
