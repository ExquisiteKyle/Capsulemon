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

    if (cards.length === 0) {
      return resolve(assignedCards);
    }

    // Use a transaction to ensure data consistency
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Process cards sequentially to avoid race conditions
      const processCard = (index) => {
        if (index >= cards.length) {
          // All cards processed, commit transaction
          db.run("COMMIT");
          resolve(assignedCards);
          return;
        }

        const card = cards[index];

        // Check if user already has this card
        db.get(
          "SELECT id, quantity FROM owned_cards WHERE user_id = ? AND card_id = ?",
          [userId, card.card_id],
          (err, existingCard) => {
            if (err) {
              console.error("Check existing card DB error:", err);
              db.run("ROLLBACK");
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
                    db.run("ROLLBACK");
                    return reject(err);
                  }

                  assignedCards.push({
                    ...card,
                    quantity: existingCard.quantity + 1,
                    isNew: false,
                  });

                  // Process next card
                  processCard(index + 1);
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
                    db.run("ROLLBACK");
                    return reject(err);
                  }

                  assignedCards.push({
                    ...card,
                    quantity: 1,
                    isNew: true,
                  });

                  // Process next card
                  processCard(index + 1);
                }
              );
            }
          }
        );
      };

      // Start processing from the first card
      processCard(0);
    });
  });
