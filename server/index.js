import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./dbInitializer.js"; // Added .js extension
import { generateToken, doubleCsrfProtection } from "./middleware/csrf.js"; // Keep .js extension
import createRoutes from "./routes/index.js"; // Default import for routes

const app = express();
const port = 3001;

// Middleware
app.use(
  cors({
    origin: process.env.ORIGIN_SITE,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
); // Allow credentials from your frontend origin and specify allowed methods
app.use(bodyParser.json());
app.use(cookieParser());

// Apply CSRF protection middleware
app.use(doubleCsrfProtection);

// Add CSRF token endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(res) });
});

// Database setup
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err);
    // No return here, server will likely not start or function correctly without DB
    // depending on how it's handled downstream. Keeping as is for now.
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase(db);
  }
});

// Use the imported routes
const routes = createRoutes(db);
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
