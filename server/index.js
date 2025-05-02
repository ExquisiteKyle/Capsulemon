require("dotenv").config({ path: "./.env.local" });
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { initializeDatabase } = require("./dbInitializer"); // Import the initializer

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

// Import and use routes
const routes = require("./routes/index")(db);
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
