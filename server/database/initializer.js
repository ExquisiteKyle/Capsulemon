import { createTables } from "./schema.js";
import {
  createDefaultUsers,
  createDefaultElements,
  createDefaultCards,
  createDefaultPacks,
  createDefaultPackCombinations,
} from "./seedData.js";

const dropTables = (db) =>
  Promise.resolve()
    .then(() => db.run("DROP TABLE IF EXISTS pack_combination"))
    .then(() => db.run("DROP TABLE IF EXISTS owned_cards"))
    .then(() => db.run("DROP TABLE IF EXISTS cards"))
    .then(() => db.run("DROP TABLE IF EXISTS elements"))
    .then(() => db.run("DROP TABLE IF EXISTS packs"))
    .then(() => db.run("DROP TABLE IF EXISTS users"));

export const initializeDatabase = (db) => {
  if (!db) {
    console.error("Database instance not provided to initializeDatabase");
    return Promise.reject(new Error("No database instance provided"));
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      dropTables(db)
        .then(() => createTables(db))
        .then(() => createDefaultElements(db))
        .then(() => createDefaultUsers(db))
        .then(() => createDefaultCards(db))
        .then(() => createDefaultPacks(db))
        .then(() => createDefaultPackCombinations(db))
        .then(resolve)
        .catch((err) => {
          console.error("Error initializing database:", err);
          reject(err);
        });
    });
  });
};
