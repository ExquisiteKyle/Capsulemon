import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./dbInitializer.js"; // Added .js extension
import {
  generateCsrfToken,
  csrfMiddleware,
  validateExistingToken,
} from "./middleware/csrf.js"; // Keep .js extension
import { initializeAuth } from "./middleware/auth.js";
import createRoutes from "./routes/index.js"; // Default import for routes

// Database setup
const setupDatabase = () =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./database.sqlite", (err) => {
      if (err) {
        console.error("Error opening database:", err);
        reject(err);
        return;
      }
      console.log("Connected to SQLite database");
      resolve(db);
    });
  });

const startServer = async () => {
  try {
    const db = await setupDatabase();
    // await initializeDatabase(db);

    const app = express();
    const port = process.env.PORT || 3001;

    // Middleware order is important
    app.use(cookieParser()); // Must be first for CSRF to work

    app.use(
      cors({
        origin: process.env.ORIGIN_SITE,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    ); // Allow credentials from your frontend origin and specify allowed methods
    app.use(bodyParser.json());

    // Initialize authentication middleware
    const { authenticateUser, requireAdmin } = initializeAuth(db);

    // Initialize and mount all routes
    const routes = createRoutes(db, {
      authenticateUser,
      requireAdmin,
      generateCsrfToken,
      csrfMiddleware,
      validateExistingToken,
    });
    app.use("/", routes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
