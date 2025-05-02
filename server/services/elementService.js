// Function to get all elements
const getAllElements = (db, callback) => {
  db.all("SELECT * FROM elements", (err, elements) => {
    // Use the provided callback to handle the result or error
    if (err) {
      console.error("Get elements DB error:", err);
      // Pass error to callback
      return callback(err);
    }
    // Pass results to callback
    callback(null, elements);
  });
};

module.exports = {
  getAllElements,
};
