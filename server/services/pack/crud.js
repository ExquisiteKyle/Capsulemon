// Pack CRUD Operations
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
