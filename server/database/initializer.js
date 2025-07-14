import { createTables } from "./schema.js";
import {
  createDefaultUsers,
  createDefaultElements,
  createDefaultCards,
  createDefaultPacks,
  createDefaultPackCombinations,
} from "./seedData.js";

// Helper function to check if database is empty
const isDatabaseEmpty = (db) =>
  new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.count === 0);
    });
  });

export const initializeDatabase = (db) => {
  if (!db) {
    console.error("Database instance not provided to initializeDatabase");
    return Promise.reject(new Error("No database instance provided"));
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // First, ensure all tables exist
      createTables(db)
        .then(() => isDatabaseEmpty(db))
        .then((isEmpty) => {
          if (isEmpty) {
            console.log("Database is empty, seeding with default data...");
            // Only seed data if database is empty
            return createDefaultElements(db)
              .then(() => createDefaultUsers(db))
              .then(() => createDefaultCards(db))
              .then(() => createDefaultPacks(db))
              .then(() => createDefaultPackCombinations(db));
          } else {
            console.log("Database already contains data, skipping seeding...");
            return Promise.resolve();
          }
        })
        .then(resolve)
        .catch((err) => {
          console.error("Error initializing database:", err);
          reject(err);
        });
    });
  });
};
