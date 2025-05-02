// Function to create a new card
const createCard = (db, cardData, callback) => {
  const { name, rarity, element_id, power, image_url } = cardData;

  // Basic validation (can also be done in route handler)
  if (!name || !rarity || !element_id || !power) {
    // Use callback to indicate missing fields (as a form of error)
    return callback(new Error("Missing required card fields"));
  }

  db.run(
    "INSERT INTO cards (name, rarity, element_id, power, image_url) VALUES (?, ?, ?, ?, ?)",
    [name, rarity, element_id, power, image_url],
    function (err) {
      // Use 'function' to access 'this.lastID'
      if (err) {
        console.error("Add card DB error:", err);
        // Pass error to callback
        return callback(err);
      }
      // Pass success with the new ID to callback
      callback(null, { id: this.lastID });
    }
  );
};

// Function to get cards owned by a specific user
const getCards = (db, userId, callback) => {
  db.all(
    `SELECT c.*, e.name as element_name 
     FROM cards c 
     JOIN elements e ON c.element_id = e.id
     JOIN cards uc ON c.id = uc.id
     WHERE uc.id = ?`,
    [userId],
    (err, cards) => {
      if (err) {
        return callback(err);
      }
      callback(null, cards);
    }
  );
};

module.exports = {
  createCard,
  getCards,
};
