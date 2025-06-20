import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const handleRegister = (db, username, password) =>
  new Promise((resolve, reject) => {
    if (!username || !password) {
      return reject({
        status: 400,
        message: "Username and password are required",
      });
    }

    if (username.length < 3) {
      return reject({
        status: 400,
        message: "Username must be at least 3 characters long",
      });
    }

    if (password.length < 6) {
      return reject({
        status: 400,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if username already exists
    db.get(
      "SELECT id FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("Register DB check error:", err);
          return reject({
            status: 500,
            message: "Database error during registration",
          });
        }

        if (user) {
          return reject({
            status: 409,
            message: "Username already exists",
          });
        }

        // Hash password and create user
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Register bcrypt hash error:", err);
            return reject({
              status: 500,
              message: "Error processing registration",
            });
          }

          db.run(
            "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
            [username, hashedPassword, false],
            function (err) {
              if (err) {
                console.error("Register DB insert error:", err);
                return reject({
                  status: 500,
                  message: "Database error during registration",
                });
              }

              resolve({
                id: this.lastID,
                username,
                isAdmin: false,
                credits: 0, // Default credits for new users
              });
            }
          );
        });
      }
    );
  });

export const handleLogin = (db, username, password) =>
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

          resolve({
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            credits: user.credits || 0,
          });
        });
      }
    );
  });

export const generateAuthToken = (user) =>
  jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
