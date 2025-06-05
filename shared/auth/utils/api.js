// Get CSRF token using Double Submit Cookie Pattern
const getCSRFToken = (API_BASE_URL) =>
  fetch(`${API_BASE_URL}/auth/csrf-token`, {
    credentials: "include", // Important: include cookies
  })
    .then((response) => {
      if (!response.ok) {
        // If unauthorized, don't throw error - just return null
        if (response.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch CSRF token");
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return null;
      if (!data.csrfToken) {
        throw new Error("Invalid CSRF token received");
      }
      return data.csrfToken;
    })
    .catch((error) => {
      console.error("Error getting CSRF token:", error);
      throw error;
    });

// Generic function to make authenticated API calls
const fetchWithAuth =
  (API_BASE_URL) =>
  (endpoint, options = {}) =>
    getCSRFToken(API_BASE_URL)
      .then((token) => {
        const headers = {
          "Content-Type": "application/json",
          ...options.headers,
        };

        // Only add CSRF token if we have one (user is authenticated)
        if (token) {
          headers["X-CSRF-Token"] = token;
        }

        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          credentials: "include", // Always include cookies for authentication
          headers,
        });
      })
      .catch((error) => {
        console.error("Error in fetchWithAuth:", error);
        throw error;
      });

// Authentication API functions factory
export const createAuthAPI = (API_BASE_URL) => {
  const authenticatedFetch = fetchWithAuth(API_BASE_URL);

  return {
    loginUser: (username, password) =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }),

    logoutUser: () =>
      authenticatedFetch("/logout", {
        method: "POST",
      }),

    fetchUser: () =>
      authenticatedFetch("/user", {
        method: "GET",
      }),
  };
};
