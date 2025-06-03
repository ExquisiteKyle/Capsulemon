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
