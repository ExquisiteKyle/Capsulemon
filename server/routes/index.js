const express = require("express");
const { authenticateUser, requireAdmin } = require("../middleware/auth"); // Import middleware
const { getAllElements } = require("../services/elementService"); // Import element service
const { createCard, getCards } = require("../services/cardService"); // Import card service
const bcrypt = require("bcrypt"); // Import bcrypt
const jwt = require("jsonwebtoken"); // Import jwt for token generation

// Export a function that creates the router, taking the db instance
module.exports = (db) => {
  const router = express.Router();
  const jwtSecret = process.env.JWT_SECRET; // Get JWT secret from env

  // Instantiate middleware with the db instance
  const authMiddleware = authenticateUser(db);

  // Login endpoint (still handles DB interaction directly as it's tied to login process)
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("Login DB error:", err);
          return res
            .status(500)
            .json({ message: "Database error during login" });
        }

        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        bcrypt.compare(password, user.password, (err, result) => {
          // bcrypt is needed here
          if (err) {
            console.error("Login bcrypt compare error:", err);
            return res.status(500).json({ message: "Authentication error" });
          }

          if (!result) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            jwtSecret,
            { expiresIn: "1h" }
          );

          // Set token in cookie
          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          res.json({
            message: "Login successful",
            user: {
              username: user.username,
              isAdmin: user.isAdmin,
            },
          });
        });
      }
    );
  });

  // Logout endpoint
  router.post("/logout", authMiddleware, (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  // GET authenticated user details endpoint (requires authentication middleware)
  router.get("/user", authMiddleware, (req, res) =>
    res.json({
      username: req.user.username,
      isAdmin: req.user.isAdmin,
    })
  );

  // Get all elements (requires authentication middleware)
  router.get("/elements", authMiddleware, (req, res) =>
    getAllElements(db, (err, elements) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(elements);
    })
  );

  // Add new card (requires authentication and admin middleware)
  router.post("/add-cards", authMiddleware, requireAdmin, (req, res) =>
    createCard(db, req.body, (err, result) => {
      if (err) {
        // Check for the specific "missing fields" error from service or generic DB error
        if (err.message === "Missing required card fields") {
          return res.status(400).json({ message: err.message });
        }
        // Handle other errors
        return res.status(500).json({ message: "Database error" });
      }
      // Success response
      res.json({
        message: "Card created successfully",
        id: result.id,
      });
    })
  );

  // Get cards (requires authentication)
  router.get("/cards", authMiddleware, (req, res) => {
    console.log("GET /cards endpoint called");
    console.log("User:", req.user);
    // Pass the authenticated user's ID to getCards
    getCards(db, req.user.id, (err, cards) => {
      if (err) {
        console.error("Error fetching cards:", err);
        return res.status(500).json({ message: "Database error" });
      }
      console.log("Cards found:", cards.length);
      return res.json(cards);
    });
  });

  return router; // Return the router
};
