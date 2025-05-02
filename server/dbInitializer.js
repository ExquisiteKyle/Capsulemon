const bcrypt = require("bcrypt");

const initializeDatabase = (db) => {
  if (!db) {
    console.error("Database instance not provided to initializeDatabase");
    return;
  }

  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS cards");
    db.run("DROP TABLE IF EXISTS elements");

    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE elements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rarity TEXT NOT NULL,
        element_id INTEGER NOT NULL,
        power INTEGER NOT NULL,
        image_url TEXT,
        FOREIGN KEY (element_id) REFERENCES elements(id)
      )
    `);

    createDefaultUsers(db);
    createDefaultElements(db);
  });
};

const createDefaultUsers = (db) => {
  if (!db) {
    console.error("Database instance not provided to createDefaultUsers");
    return;
  }

  const hashedTestPassword = bcrypt.hashSync("test", 10);
  db.run(
    "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
    ["test", hashedTestPassword, 0],
    (err) => err && console.error("Error inserting test user:", err.message)
  );

  const hashedAdminPassword = bcrypt.hashSync("admin", 10);
  db.run(
    "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
    ["admin", hashedAdminPassword, 1],
    (err) => err && console.error("Error inserting admin user:", err.message)
  );
};

const createDefaultElements = (db) => {
  if (!db) {
    console.error("Database instance not provided to createDefaultElements");
    return;
  }

  const elements = ["Water", "Wind", "Fire", "Earth", "Dark", "Holy"];
  elements.forEach((element) =>
    db.run(
      "INSERT INTO elements (name) VALUES (?)",
      [element],
      (err) =>
        err &&
        console.error(`Error inserting element "${element}":`, err.message)
    )
  );
};

module.exports = {
  initializeDatabase,
};
