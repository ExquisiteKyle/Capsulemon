// Get user credits
export const getUserCredits = (db, userId) =>
  new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID is required"));
    }

    db.get("SELECT credits FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error fetching user credits:", err);
        return reject(new Error("Database error while fetching credits"));
      }

      if (!row) {
        return reject(new Error("User not found"));
      }

      resolve(row.credits);
    });
  });

// Add credits to user
export const addCredits = (db, userId, amount) =>
  new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID is required"));
    }

    if (!amount || amount <= 0) {
      return reject(new Error("Amount must be greater than 0"));
    }

    db.run(
      "UPDATE users SET credits = credits + ? WHERE id = ?",
      [amount, userId],
      function (err) {
        if (err) {
          console.error("Error adding credits:", err);
          return reject(new Error("Database error while adding credits"));
        }

        if (this.changes === 0) {
          return reject(new Error("User not found"));
        }

        resolve({ userId, amount, newTotal: null });
      }
    );
  });

// Deduct credits from user (for purchases)
export const deductCredits = (db, userId, amount) =>
  new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID is required"));
    }

    if (!amount || amount <= 0) {
      return reject(new Error("Amount must be greater than 0"));
    }

    // First check if user has enough credits
    db.get("SELECT credits FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error checking user credits:", err);
        return reject(new Error("Database error while checking credits"));
      }

      if (!row) {
        return reject(new Error("User not found"));
      }

      if (row.credits < amount) {
        return reject(new Error("Insufficient credits"));
      }

      // Deduct credits
      db.run(
        "UPDATE users SET credits = credits - ? WHERE id = ?",
        [amount, userId],
        function (err) {
          if (err) {
            console.error("Error deducting credits:", err);
            return reject(new Error("Database error while deducting credits"));
          }

          resolve({ userId, amount, remainingCredits: row.credits - amount });
        }
      );
    });
  });

// Get user credits with user info
export const getUserCreditsWithInfo = (db, userId) =>
  new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID is required"));
    }

    db.get(
      "SELECT username, credits, isAdmin FROM users WHERE id = ?",
      [userId],
      (err, row) => {
        if (err) {
          console.error("Error fetching user info:", err);
          return reject(new Error("Database error while fetching user info"));
        }

        if (!row) {
          return reject(new Error("User not found"));
        }

        resolve({
          username: row.username,
          credits: row.credits || 0,
          isAdmin: row.isAdmin,
        });
      }
    );
  });
