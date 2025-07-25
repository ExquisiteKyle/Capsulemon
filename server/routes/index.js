import express from "express";
import { getAllElements } from "../services/elementService.js";
import authRoutes from "./auth.js";
import cardRoutes from "./cards.js";
import packRoutes from "./packs/index.js";
import creditRoutes from "./credits.js";

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

  // Mount auth routes (public routes)
  router.use("/auth", authRoutes(db, { generateCsrfToken }));

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

  // Logout endpoint (requires auth but not CSRF)
  router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("x-csrf-token", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
  });

  // Apply CSRF protection for all routes below
  router.use(csrfMiddleware);

  // Protected routes (require both auth and CSRF)
  router.get("/elements", (req, res) =>
    getAllElements(db)
      .then((elements) => res.json(elements))
      .catch((err) => {
        console.error("Error fetching elements:", err);
        res.status(500).json({ message: "Database error" });
      })
  );

  // Mount credit routes
  router.use(
    "/credits",
    creditRoutes(db, {
      authenticateUser,
    })
  );

  // Mount card routes (includes both card management and ownership)
  router.use(
    "/cards",
    cardRoutes(db, {
      authenticateUser,
      requireAdmin,
      generateCsrfToken,
      csrfMiddleware,
      validateExistingToken,
    })
  );

  // Mount pack routes
  router.use(
    "/packs",
    packRoutes(db, {
      authenticateUser,
      requireAdmin,
    })
  );

  return router;
};
