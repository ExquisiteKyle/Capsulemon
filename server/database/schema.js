import bcrypt from "bcrypt";

const createUser = (db, username, password, isAdmin = false, credits = 100) => {
  const hashedPassword = bcrypt.hashSync(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, isAdmin, credits) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, isAdmin, credits],
      function (err) {
        if (err) {
          console.error(
            `Error inserting ${isAdmin ? "admin" : "test"} user:`,
            err.message
          );
          return reject(err);
        }

        if (process.env.NODE_ENV !== "production") {
          console.log(
            `Created ${
              isAdmin ? "admin" : "test"
            } user: ${username} with ${credits} credits`
          );
        }
        resolve(this.lastID);
      }
    );
  });
};

const runQuery = (db, query) =>
  new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const createTables = (db) =>
  Promise.resolve()
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        credits INTEGER DEFAULT 0
      )
    `
      )
    )
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS elements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `
      )
    )
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rarity TEXT NOT NULL,
        element_id INTEGER NOT NULL,
        power INTEGER NOT NULL,
        image_url TEXT,
        FOREIGN KEY (element_id) REFERENCES elements(id)
      )
    `
      )
    )
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS owned_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        card_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        acquired_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        UNIQUE(user_id, card_id)
      )
    `
      )
    )
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS packs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        cost INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
      )
    )
    .then(() =>
      runQuery(
        db,
        `
      CREATE TABLE IF NOT EXISTS pack_combination (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pack_id INTEGER NOT NULL,
        card_id INTEGER NOT NULL,
        drop_rate DECIMAL(5,2) NOT NULL,
        FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        UNIQUE(pack_id, card_id)
      )
    `
      )
    );

export { createUser, runQuery };
