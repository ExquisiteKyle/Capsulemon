// Pack Operations
export const createPack = (db, { name, cost }) => {
  if (!name || !cost) {
    return Promise.reject(new Error("Name and cost are required for a pack"));
  }

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO packs (name, cost) VALUES (?, ?)",
      [name, cost],
      function (err) {
        if (err) {
          console.error("Create pack DB error:", err);
          reject(err);
          return;
        }
        resolve({ id: this.lastID, name, cost });
      }
    );
  });
};

export const getAllPacks = (db) =>
  new Promise((resolve, reject) => {
    db.all(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM pack_combination pc WHERE pc.pack_id = p.id) as card_count
       FROM packs p
       ORDER BY p.created_at DESC`,
      (err, packs) => {
        if (err) {
          console.error("Get packs DB error:", err);
          reject(err);
          return;
        }
        resolve(packs);
      }
    );
  });

export const getPackById = (db, packId) =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM pack_combination pc WHERE pc.pack_id = p.id) as card_count
       FROM packs p
       WHERE p.id = ?`,
      [packId],
      (err, pack) => {
        if (err) {
          console.error("Get pack DB error:", err);
          reject(err);
          return;
        }
        if (!pack) {
          reject(new Error("Pack not found"));
          return;
        }
        resolve(pack);
      }
    );
  });

export const updatePack = (db, packId, { name, cost }) =>
  new Promise((resolve, reject) => {
    if (!name && !cost) {
      reject(new Error("At least one field (name or cost) must be provided"));
      return;
    }

    const updates = [];
    const values = [];
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (cost) {
      updates.push("cost = ?");
      values.push(cost);
    }
    values.push(packId);

    db.run(
      `UPDATE packs SET ${updates.join(", ")} WHERE id = ?`,
      values,
      function (err) {
        if (err) {
          console.error("Update pack DB error:", err);
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("Pack not found"));
          return;
        }
        resolve({ id: packId });
      }
    );
  });

export const deletePack = (db, packId) =>
  new Promise((resolve, reject) => {
    db.run("DELETE FROM packs WHERE id = ?", [packId], function (err) {
      if (err) {
        console.error("Delete pack DB error:", err);
        reject(err);
        return;
      }
      if (this.changes === 0) {
        reject(new Error("Pack not found"));
        return;
      }
      resolve({ id: packId });
    });
  });

// Pack Combination Operations
export const addCardToPack = (db, { packId, cardId, dropRate }) => {
  if (!packId || !cardId || dropRate === undefined) {
    return Promise.reject(
      new Error("Pack ID, card ID, and drop rate are required")
    );
  }

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO pack_combination (pack_id, card_id, drop_rate) VALUES (?, ?, ?)",
      [packId, cardId, dropRate],
      function (err) {
        if (err) {
          console.error("Add card to pack DB error:", err);
          reject(err);
          return;
        }
        // After inserting, fetch the complete card data
        db.get(
          `SELECT pc.*, c.name as card_name, c.rarity, c.power, c.image_url,
                  e.name as element_name
           FROM pack_combination pc
           JOIN cards c ON pc.card_id = c.id
           JOIN elements e ON c.element_id = e.id
           WHERE pc.id = ?`,
          [this.lastID],
          (err, card) => {
            if (err) {
              console.error("Get added card DB error:", err);
              reject(err);
              return;
            }
            resolve(card);
          }
        );
      }
    );
  });
};

export const getPackCards = (db, packId) =>
  new Promise((resolve, reject) => {
    db.all(
      `SELECT pc.*, c.name as card_name, c.rarity, c.power, c.image_url,
              e.name as element_name
       FROM pack_combination pc
       JOIN cards c ON pc.card_id = c.id
       JOIN elements e ON c.element_id = e.id
       WHERE pc.pack_id = ?
       ORDER BY pc.drop_rate DESC`,
      [packId],
      (err, cards) => {
        if (err) {
          console.error("Get pack cards DB error:", err);
          reject(err);
          return;
        }
        resolve(cards);
      }
    );
  });

export const updateCardInPack = (db, packId, cardId, { dropRate }) =>
  new Promise((resolve, reject) => {
    if (dropRate === undefined) {
      reject(new Error("Drop rate must be provided"));
      return;
    }

    db.run(
      "UPDATE pack_combination SET drop_rate = ? WHERE pack_id = ? AND card_id = ?",
      [dropRate, packId, cardId],
      function (err) {
        if (err) {
          console.error("Update pack combination DB error:", err);
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("Pack combination not found"));
          return;
        }
        resolve({ packId, cardId, dropRate });
      }
    );
  });

export const removeCardFromPack = (db, packId, cardId) =>
  new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM pack_combination WHERE pack_id = ? AND card_id = ?",
      [packId, cardId],
      function (err) {
        if (err) {
          console.error("Remove card from pack DB error:", err);
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("Pack combination not found"));
          return;
        }
        resolve({ packId, cardId });
      }
    );
  });

// Pack Opening Operations
export const openPack = (db, userId, packId) =>
  new Promise((resolve, reject) => {
    // First, get the pack details and check if it exists
    db.get("SELECT * FROM packs WHERE id = ?", [packId], (err, pack) => {
      if (err) {
        console.error("Get pack for opening DB error:", err);
        return reject(err);
      }
      if (!pack) {
        return reject(new Error("Pack not found"));
      }

      // Get all cards in the pack with their drop rates
      db.all(
        `SELECT pc.*, c.name as card_name, c.rarity, c.power, c.image_url,
                  e.name as element_name
           FROM pack_combination pc
           JOIN cards c ON pc.card_id = c.id
           JOIN elements e ON c.element_id = e.id
           WHERE pc.pack_id = ?
           ORDER BY pc.drop_rate DESC`,
        [packId],
        (err, packCards) => {
          if (err) {
            console.error("Get pack cards for opening DB error:", err);
            return reject(err);
          }
          if (packCards.length === 0) {
            return reject(new Error("Pack has no cards"));
          }

          // Draw cards based on drop rates
          const drawnCards = drawCardsFromPack(packCards);

          // Assign cards to user
          assignCardsToUser(db, userId, drawnCards)
            .then((assignedCards) => {
              resolve({
                packId,
                packName: pack.name,
                packCost: pack.cost,
                drawnCards: assignedCards,
              });
            })
            .catch(reject);
        }
      );
    });
  });

// Helper function to draw cards based on drop rates
const drawCardsFromPack = (packCards) => {
  const drawnCards = [];
  const cardsPerPack = 5; // Default number of cards per pack

  for (let i = 0; i < cardsPerPack; i++) {
    const random = Math.random() * 100; // Random number between 0-100
    let cumulativeRate = 0;

    for (const card of packCards) {
      cumulativeRate += card.drop_rate;
      if (random <= cumulativeRate) {
        drawnCards.push(card);
        break;
      }
    }

    // If no card was drawn (fallback), pick a random card
    if (drawnCards.length <= i) {
      const randomIndex = Math.floor(Math.random() * packCards.length);
      drawnCards.push(packCards[randomIndex]);
    }
  }

  return drawnCards;
};

// Helper function to assign cards to user
const assignCardsToUser = (db, userId, cards) =>
  new Promise((resolve, reject) => {
    const assignedCards = [];
    let completed = 0;

    if (cards.length === 0) {
      return resolve(assignedCards);
    }

    cards.forEach((card) => {
      // Check if user already has this card
      db.get(
        "SELECT id, quantity FROM owned_cards WHERE user_id = ? AND card_id = ?",
        [userId, card.card_id],
        (err, existingCard) => {
          if (err) {
            console.error("Check existing card DB error:", err);
            return reject(err);
          }

          if (existingCard) {
            // Update existing card quantity
            db.run(
              "UPDATE owned_cards SET quantity = quantity + 1 WHERE id = ?",
              [existingCard.id],
              function (err) {
                if (err) {
                  console.error("Update quantity DB error:", err);
                  return reject(err);
                }

                assignedCards.push({
                  ...card,
                  quantity: existingCard.quantity + 1,
                  isNew: false,
                });

                completed++;
                if (completed === cards.length) {
                  resolve(assignedCards);
                }
              }
            );
          } else {
            // Insert new card
            db.run(
              "INSERT INTO owned_cards (user_id, card_id, quantity) VALUES (?, ?, 1)",
              [userId, card.card_id],
              function (err) {
                if (err) {
                  console.error("Assign card DB error:", err);
                  return reject(err);
                }

                assignedCards.push({
                  ...card,
                  quantity: 1,
                  isNew: true,
                });

                completed++;
                if (completed === cards.length) {
                  resolve(assignedCards);
                }
              }
            );
          }
        }
      );
    });
  });
