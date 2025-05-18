// Function to create a new card
export const createCard = (db, cardData) => {
  const { name, rarity, element_id, power, image_url } = cardData;

  // Basic validation
  if (!name || !rarity || !element_id || !power) {
    return Promise.reject(new Error("Missing required card fields"));
  }

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO cards (name, rarity, element_id, power, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, rarity, element_id, power, image_url],
      function (err) {
        if (err) {
          console.error("Add card DB error:", err);
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
  });
};

// Function to get cards owned by a specific user
export const getCards = (db, userId) =>
  new Promise((resolve, reject) => {
    db.all(
      `SELECT c.*, e.name as element_name 
       FROM cards c 
       JOIN elements e ON c.element_id = e.id
       JOIN cards uc ON c.id = uc.id
       WHERE uc.id = ?`,
      [userId],
      (err, cards) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(cards);
      }
    );
  });
