// This file should be deleted as its functionality has been moved to routes/index.js

import express from "express";
import {
  handleRegister,
  handleLogin,
  generateAuthToken,
} from "../services/authService.js";

const router = express.Router();

export default (db, { generateCsrfToken }) => {
  // Public routes (no auth or CSRF needed)
  router.post("/register", (req, res) => {
    const { username, password } = req.body;

    handleRegister(db, username, password)
      .then((user) => {
        const jwtToken = generateAuthToken(user);

        res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        return generateCsrfToken(res).then(() => ({
          message: "Registration successful",
          user: {
            username: user.username,
            isAdmin: user.isAdmin,
            credits: user.credits,
          },
        }));
      })
      .then((response) => res.json(response))
      .catch((error) => {
        const status = error.status || 500;
        const message = error.message || "Registration failed";
        res.status(status).json({ message });
      });
  });

  router.post("/login", (req, res) => {
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
            credits: user.credits,
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

  return router;
};
