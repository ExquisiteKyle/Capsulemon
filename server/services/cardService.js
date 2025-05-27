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

// Function to update an existing card
export const updateCard = (db, cardId, cardData) => {
  const { name, rarity, element_id, power, image_url } = cardData;

  // Basic validation
  if (!name || !rarity || !element_id || !power) {
    return Promise.reject(new Error("Missing required card fields"));
  }

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE cards 
       SET name = ?, rarity = ?, element_id = ?, power = ?, image_url = ?
       WHERE id = ?`,
      [name, rarity, element_id, power, image_url, cardId],
      function (err) {
        if (err) {
          console.error("Update card DB error:", err);
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("Card not found"));
          return;
        }
        resolve({ id: cardId });
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

// Function to get cards owned by a specific user
export const getOwnCards = (db, userId) =>
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

// Function to delete a card
export const deleteCard = (db, cardId) => {
  return new Promise((resolve, reject) => {
    // First check if the card exists and is not owned by any user
    db.get(
      `SELECT COUNT(*) as count FROM owned_cards WHERE card_id = ?`,
      [cardId],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        if (result.count > 0) {
          reject(new Error("Cannot delete card that is owned by users"));
          return;
        }

        // If card is not owned, proceed with deletion
        db.run(`DELETE FROM cards WHERE id = ?`, [cardId], function (err) {
          if (err) {
            console.error("Delete card DB error:", err);
            reject(err);
            return;
          }
          if (this.changes === 0) {
            reject(new Error("Card not found"));
            return;
          }
          resolve({ id: cardId });
        });
      }
    );
  });
};
