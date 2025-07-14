import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

dotenv.config({ path: join(rootDir, ".env.local") });
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./database/initializer.js";
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
    await initializeDatabase(db);

    const app = express();
    const port = process.env.PORT || 3001;

    // Middleware order is important
    app.use(cookieParser()); // Must be first for CSRF to work

    // Configure allowed origins
    const allowedOrigins = [
      process.env.PROJECT_URL || process.env.ORIGIN_USER_SITE, // Project frontend
      process.env.ADMIN_URL || process.env.ORIGIN_ADMIN_SITE, // Admin frontend
    ];

    app.use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          if (allowedOrigins.indexOf(origin) === -1) {
            const msg =
              "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
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
      console.log("Allowed origins:", allowedOrigins);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
