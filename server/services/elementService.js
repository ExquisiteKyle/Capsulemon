// Function to get all elements
export const getAllElements = (db, callback) => {
  db.all("SELECT * FROM elements", (err, rows) => {
    // Use the provided callback to handle the result or error
    if (err) {
      console.error("Get elements DB error:", err);
      // Pass error to callback
      return callback(err);
    }
    // Pass results to callback
    callback(null, rows);
  });
};
