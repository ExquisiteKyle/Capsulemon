const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Generic function to make authenticated API calls
const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Always include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": await getCSRFToken(),
      ...options.headers,
    },
  });

  // You can add common error handling here if needed, e.g., checking for 500 status
  // For now, we'll let the calling code handle specific statuses like 401/403

  return response;
};

// Specific API call functions

export const fetchUser = async () => fetchWithAuth("/user");

export const fetchElements = async () => fetchWithAuth("/elements");

export const loginUser = async (username, password) =>
  fetchWithAuth("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const logoutUser = async () =>
  fetchWithAuth("/logout", {
    method: "POST",
  });

export const createCard = async (cardData) =>
  fetchWithAuth("/add-cards", {
    method: "POST",
    body: JSON.stringify(cardData),
  });

export const fetchCards = async () => fetchWithAuth("/cards");

// Add helper function
const getCSRFToken = async () => {
  const response = await fetch(`${API_BASE_URL}/csrf-token`);
  const { csrfToken } = await response.json();
  return csrfToken;
};
