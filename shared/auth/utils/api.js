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
    // Auth endpoints
    registerUser: (username, password) =>
      fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }),

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
      fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),

    fetchUser: () =>
      authenticatedFetch("/user", {
        method: "GET",
      }),

    // Card endpoints
    getOwnedCards: () =>
      authenticatedFetch("/cards/owned", {
        method: "GET",
      }),

    getAllCards: () =>
      authenticatedFetch("/cards", {
        method: "GET",
      }),

    // Pack endpoints
    getAllPacks: () =>
      authenticatedFetch("/packs", {
        method: "GET",
      }),

    getPack: (packId) =>
      authenticatedFetch(`/packs/${packId}`, {
        method: "GET",
      }),

    getPackCards: (packId) =>
      authenticatedFetch(`/packs/${packId}/cards`, {
        method: "GET",
      }),

    openPack: (packId) =>
      authenticatedFetch(`/packs/${packId}/open`, {
        method: "POST",
      }),

    // Credit endpoints
    getUserCredits: () =>
      authenticatedFetch("/credits", {
        method: "GET",
      }),

    getUserInfo: () =>
      authenticatedFetch("/credits/user-info", {
        method: "GET",
      }),

    purchaseCredits: (amount, paymentMethod) =>
      authenticatedFetch("/credits/purchase", {
        method: "POST",
        body: JSON.stringify({ amount, paymentMethod }),
      }),
  };
};
