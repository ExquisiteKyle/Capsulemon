import express from "express";
import { getAllElements } from "../services/elementService.js";
import { createCard, getCards } from "../services/cardService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createCardRoutes from "./cards.js";

const handleLogin = (db, username, password) =>
  new Promise((resolve, reject) => {
    if (!username || !password) {
      return reject({
        status: 400,
        message: "Username and password are required",
      });
    }

    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("Login DB error:", err);
          return reject({
            status: 500,
            message: "Database error during login",
          });
        }

        if (!user) {
          return reject({ status: 401, message: "Invalid credentials" });
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.error("Login bcrypt compare error:", err);
            return reject({ status: 500, message: "Authentication error" });
          }

          if (!result) {
            return reject({ status: 401, message: "Invalid credentials" });
          }

          resolve(user);
        });
      }
    );
  });

const generateAuthToken = (user) =>
  jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

export default (
  db,
  {
    authenticateUser,
    requireAdmin,
    generateCsrfToken,
    csrfMiddleware,
    validateExistingToken,
  }
) => {
  const router = express.Router();

  // Public routes (no auth or CSRF needed)
  router.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    handleLogin(db, username, password)
      .then((user) => {
        const jwtToken = generateAuthToken(user);

        res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        return generateCsrfToken(res).then(() => ({
          message: "Login successful",
          user: {
            username: user.username,
            isAdmin: user.isAdmin,
          },
        }));
      })
      .then((response) => res.json(response))
      .catch((error) => {
        const status = error.status || 500;
        const message = error.message || "Login failed";
        res.status(status).json({ message });
      });
  });

  // Authentication check middleware for all routes below
  router.use(authenticateUser);

  // Get user info
  router.get("/user", (req, res) =>
    res.json({
      username: req.user.username,
      isAdmin: req.user.isAdmin,
    })
  );

  // CSRF token endpoint (requires auth)
  router.get("/auth/csrf-token", (req, res) =>
    validateExistingToken(req)
      .then((token) => res.json({ csrfToken: token }))
      .catch(() =>
        generateCsrfToken(res).then((token) => {
          console.log("Generated new CSRF token");
          return res.json({ csrfToken: token });
        })
      )
      .catch((error) => {
        console.error("Error handling CSRF token:", error);
        res.status(500).json({ message: "Failed to handle CSRF token" });
      })
  );

  // Apply CSRF protection for all routes below
  router.use(csrfMiddleware);

  // Protected routes (require both auth and CSRF)
  router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("x-csrf-token", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
  });

  router.get("/elements", (req, res) =>
    getAllElements(db)
      .then((elements) => res.json(elements))
      .catch((err) => {
        console.error("Error fetching elements:", err);
        res.status(500).json({ message: "Database error" });
      })
  );

  // Mount card routes (includes both card management and ownership)
  router.use(
    "/cards",
    createCardRoutes(db, {
      authenticateUser,
      requireAdmin,
      generateCsrfToken,
      csrfMiddleware,
      validateExistingToken,
    })
  );

  return router;
};
