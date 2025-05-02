import { createContext, useContext, useState, useEffect } from "react";
import { fetchUser, loginUser, logoutUser } from "../utils/api"; // Import API functions

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

  useEffect(() => {
    const checkAuthStatus = async () => {
      fetchUser()
        .then(async (userResponse) => {
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Use helper function for authenticated state
            updateAuthState(true, userData.isAdmin, userData.username);
          } else if (userResponse.status === 401) {
            // Use helper function for unauthenticated state on 401
            updateAuthState(false, false, null);
          } else {
            console.error(
              "Error checking authentication status:",
              userResponse.status
            );
            setError("An error occurred while checking login status.");
            // Also set unauthenticated state on other errors
            updateAuthState(false, false, null);
          }
        })
        .catch((err) => {
          console.error("Error during authentication check:", err);
          setError("An error occurred during authentication check.");
          // Use helper function for unauthenticated state on fetch error
          updateAuthState(false, false, null);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setError(null);
    return loginUser(username, password)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Login failed");
          // Use helper function for unauthenticated state on non-ok response
          updateAuthState(false, false, null);
          return false;
        }

        const data = await response.json();
        // Use helper function for authenticated state on successful login
        updateAuthState(true, data.user.isAdmin, data.user.username);
        return true;
      })
      .catch((err) => {
        console.error("Error during login:", err);
        setError("An error occurred during login.");
        // Use helper function for unauthenticated state on fetch error
        updateAuthState(false, false, null);
        return false;
      });
  };

  const logout = async () => {
    setError(null);
    return logoutUser()
      .then(async (response) => {
        if (!response.ok) {
          console.error("Logout failed", response.status);
          setError("Logout failed.");
          // Use helper function for unauthenticated state on non-ok response
          updateAuthState(false, false, null);
          return false;
        }

        // Use helper function for unauthenticated state on successful logout
        updateAuthState(false, false, null);
        console.log("Logged out successfully");
        return true;
      })
      .catch((err) => {
        console.error("Error during logout:", err);
        setError("An error occurred during logout.");
        // Use helper function for unauthenticated state on fetch error
        updateAuthState(false, false, null);
        return false;
      });
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
