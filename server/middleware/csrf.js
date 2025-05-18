import { randomBytes } from "crypto";

const CSRF_COOKIE_NAME = "x-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours

// Create a middleware that selectively applies CSRF protection
const csrfMiddleware = (req, res, next) => {
  // Public routes that don't need CSRF protection
  const publicPaths = ["/auth/login", "/auth/csrf-token"];

  if (publicPaths.includes(req.path)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // Debug logs at debug level
  if (process.env.NODE_ENV !== "production") {
    console.log("Path requiring CSRF:", req.path);
    console.log("Request headers:", req.headers);
    console.log("Cookies:", req.cookies);
  }

  // Validate CSRF token
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.error("CSRF validation failed:", {
      path: req.path,
      cookieExists: !!cookieToken,
      headerExists: !!headerToken,
      match: cookieToken === headerToken,
    });
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};

// Safe token generator that handles missing cookies
const generateToken = (res) => {
  if (!res || typeof res.cookie !== "function") {
    return Promise.reject(
      new Error("Invalid response object for CSRF token generation")
    );
  }

  try {
    const token = randomBytes(32).toString("hex");

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: TOKEN_EXPIRY,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Generated new CSRF token");
    }

    return Promise.resolve(token);
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return Promise.reject(error);
  }
};

// Validate if a token exists and is still valid
const validateExistingToken = (req) => {
  const token = req.cookies[CSRF_COOKIE_NAME];
  return token
    ? Promise.resolve(token)
    : Promise.reject(new Error("No valid token found"));
};

export {
  generateToken as generateCsrfToken,
  csrfMiddleware,
  validateExistingToken,
};
