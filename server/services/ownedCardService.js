// Function to assign a card to a user
export const assignCardToUser = (db, userId, cardId, quantity = 1) => {
  return new Promise((resolve, reject) => {
    // First check if the user already has this card
    db.get(
      "SELECT id, quantity FROM owned_cards WHERE user_id = ? AND card_id = ?",
      [userId, cardId],
      (err, existingCard) => {
        if (err) {
          console.error("Check existing card DB error:", err);
          reject(err);
          return;
        }

        if (existingCard) {
          // Update existing card quantity
          db.run(
            "UPDATE owned_cards SET quantity = quantity + ? WHERE id = ?",
            [quantity, existingCard.id],
            function (err) {
              if (err) {
                console.error("Update quantity DB error:", err);
                reject(err);
                return;
              }
              resolve({
                id: existingCard.id,
                quantity: existingCard.quantity + quantity,
              });
            }
          );
        } else {
          // Insert new card
          db.run(
            "INSERT INTO owned_cards (user_id, card_id, quantity) VALUES (?, ?, ?)",
            [userId, cardId, quantity],
            function (err) {
              if (err) {
                console.error("Assign card DB error:", err);
                reject(err);
                return;
              }
              resolve({ id: this.lastID, quantity });
            }
          );
        }
      }
    );
  });
};

// Function to get all cards owned by a user
export const getOwnedCards = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT c.*, e.name as element_name, oc.acquired_date, oc.quantity
       FROM owned_cards oc
       JOIN cards c ON oc.card_id = c.id
       JOIN elements e ON c.element_id = e.id
       WHERE oc.user_id = ?
       ORDER BY oc.acquired_date DESC`,
      [userId],
      (err, cards) => {
        if (err) {
          console.error("Get owned cards DB error:", err);
          reject(err);
          return;
        }
        resolve(cards);
      }
    );
  });
};

// Function to remove cards from a user's collection
export const removeCardFromUser = (db, userId, cardId, quantity = 1) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, quantity FROM owned_cards WHERE user_id = ? AND card_id = ?",
      [userId, cardId],
      (err, card) => {
        if (err) {
          console.error("Check card quantity DB error:", err);
          reject(err);
          return;
        }

        if (!card) {
          reject(new Error("Card not found in user's collection"));
          return;
        }

        if (card.quantity <= quantity) {
          // Remove the entire record if quantity will be 0 or less
          db.run(
            "DELETE FROM owned_cards WHERE id = ?",
            [card.id],
            function (err) {
              if (err) {
                console.error("Remove card DB error:", err);
                reject(err);
                return;
              }
              resolve({ success: true, remaining: 0 });
            }
          );
        } else {
          // Decrease the quantity
          db.run(
            "UPDATE owned_cards SET quantity = quantity - ? WHERE id = ?",
            [quantity, card.id],
            function (err) {
              if (err) {
                console.error("Update quantity DB error:", err);
                reject(err);
                return;
              }
              resolve({
                success: true,
                remaining: card.quantity - quantity,
              });
            }
          );
        }
      }
    );
  });
};

// Function to check if a user owns a specific card
export const checkCardOwnership = (db, userId, cardId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, quantity FROM owned_cards WHERE user_id = ? AND card_id = ?",
      [userId, cardId],
      (err, row) => {
        if (err) {
          console.error("Check card ownership DB error:", err);
          reject(err);
          return;
        }
        resolve({
          owns: !!row,
          quantity: row ? row.quantity : 0,
        });
      }
    );
  });
};
