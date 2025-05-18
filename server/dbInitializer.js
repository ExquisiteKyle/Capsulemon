import bcrypt from "bcrypt";

const createUser = (db, username, password, isAdmin = false) => {
  const hashedPassword = bcrypt.hashSync(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
      [username, hashedPassword, isAdmin],
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
            `Created ${isAdmin ? "admin" : "test"} user: ${username}`
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

export const initializeDatabase = (db) => {
  if (!db) {
    console.error("Database instance not provided to initializeDatabase");
    return Promise.reject(new Error("No database instance provided"));
  }

  const dropTables = () =>
    Promise.all([
      runQuery(db, "DROP TABLE IF EXISTS users"),
      runQuery(db, "DROP TABLE IF EXISTS cards"),
      runQuery(db, "DROP TABLE IF EXISTS elements"),
    ]);

  const createTables = () =>
    Promise.all([
      runQuery(
        db,
        `
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          isAdmin BOOLEAN DEFAULT 0
        )
      `
      ),
      runQuery(
        db,
        `
        CREATE TABLE elements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        )
      `
      ),
      runQuery(
        db,
        `
        CREATE TABLE cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          rarity TEXT NOT NULL,
          element_id INTEGER NOT NULL,
          power INTEGER NOT NULL,
          image_url TEXT,
          FOREIGN KEY (element_id) REFERENCES elements(id)
        )
      `
      ),
    ]);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      dropTables()
        .then(() => createTables())
        .then(() =>
          Promise.all([createDefaultUsers(db), createDefaultElements(db)])
        )
        .then(resolve)
        .catch((err) => {
          console.error("Error initializing database:", err);
          reject(err);
        });
    });
  });
};

export const createDefaultUsers = (db) => {
  if (!db) {
    return Promise.reject(
      new Error("Database instance not provided to createDefaultUsers")
    );
  }

  const testUser = process.env.DEFAULT_TEST_USER || "test";
  const testPass = process.env.DEFAULT_TEST_PASS || "test";
  const adminUser = process.env.DEFAULT_ADMIN_USER || "admin";
  const adminPass = process.env.DEFAULT_ADMIN_PASS || "admin";

  return Promise.all([
    createUser(db, testUser, testPass, false),
    createUser(db, adminUser, adminPass, true),
  ]).then(() => {
    if (testPass === "test" || adminPass === "admin") {
      console.warn(
        "WARNING: Using default passwords. Please set DEFAULT_TEST_PASS and DEFAULT_ADMIN_PASS environment variables in production."
      );
    }
  });
};

export const createDefaultElements = (db) => {
  if (!db) {
    return Promise.reject(
      new Error("Database instance not provided to createDefaultElements")
    );
  }

  const elements = ["Water", "Wind", "Fire", "Earth", "Dark", "Holy"];

  return Promise.all(
    elements.map(
      (element) =>
        new Promise((resolve, reject) => {
          db.run("INSERT INTO elements (name) VALUES (?)", [element], (err) => {
            if (err) {
              console.error(
                `Error inserting element "${element}":`,
                err.message
              );
              reject(err);
            } else {
              resolve();
            }
          });
        })
    )
  );
};
