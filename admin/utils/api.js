const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get CSRF token using Double Submit Cookie Pattern
const getCSRFToken = () =>
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
const fetchWithAuth = (endpoint, options = {}) =>
  getCSRFToken()
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

// Specific API call functions
export const fetchUser = () => fetchWithAuth("/user");

export const fetchElements = () => fetchWithAuth("/elements");

export const logoutUser = () =>
  fetchWithAuth("/logout", {
    method: "POST",
  });

export const createCard = (cardData) =>
  fetchWithAuth("/cards", {
    method: "POST",
    body: JSON.stringify(cardData),
  });

export const fetchCards = () => fetchWithAuth("/cards");

export const fetchAllCards = () => fetchWithAuth("/cards/all");

export const updateCard = (cardId, cardData) =>
  fetchWithAuth(`/cards/${cardId}`, {
    method: "PUT",
    body: JSON.stringify(cardData),
  });

export const deleteCard = (cardId) =>
  fetchWithAuth(`/cards/${cardId}`, {
    method: "DELETE",
  });

// Login should NOT use fetchWithAuth since it needs to establish the session first
export const loginUser = (username, password) =>
  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then(async (response) => ({
      ok: response.ok,
      data: await response.json(),
      status: response.status,
    }))
    .catch(() => ({
      ok: false,
      error: "Network or server error",
      status: 500,
    }));

// Pack-related API calls
export const fetchPacks = () => fetchWithAuth("/packs");

export const fetchPackById = (packId) => fetchWithAuth(`/packs/${packId}`);

export const createPack = (packData) =>
  fetchWithAuth("/packs", {
    method: "POST",
    body: JSON.stringify(packData),
  });

export const updatePack = (packId, packData) =>
  fetchWithAuth(`/packs/${packId}`, {
    method: "PUT",
    body: JSON.stringify(packData),
  });

export const deletePack = (packId) =>
  fetchWithAuth(`/packs/${packId}`, {
    method: "DELETE",
  });

export const fetchPackCards = (packId) =>
  fetchWithAuth(`/packs/${packId}/cards`);

export const addCardToPack = (packId, cardId, dropRate) =>
  fetchWithAuth(`/packs/${packId}/cards/${cardId}`, {
    method: "POST",
    body: JSON.stringify({ dropRate }),
  });

export const updateCardInPack = (packId, cardId, dropRate) =>
  fetchWithAuth(`/packs/${packId}/cards/${cardId}`, {
    method: "PUT",
    body: JSON.stringify({ dropRate }),
  });

export const removeCardFromPack = (packId, cardId) =>
  fetchWithAuth(`/packs/${packId}/cards/${cardId}`, {
    method: "DELETE",
  });
