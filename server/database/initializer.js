import { createTables } from "./schema.js";
import {
  createDefaultUsers,
  createDefaultElements,
  createDefaultCards,
  createDefaultPacks,
  createDefaultPackCombinations,
} from "./seedData.js";

const dropTables = (db) =>
  Promise.all([
    db.run("DROP TABLE IF EXISTS users"),
    db.run("DROP TABLE IF EXISTS cards"),
    db.run("DROP TABLE IF EXISTS elements"),
    db.run("DROP TABLE IF EXISTS owned_cards"),
    db.run("DROP TABLE IF EXISTS packs"),
    db.run("DROP TABLE IF EXISTS pack_combination"),
  ]);

export const initializeDatabase = (db) => {
  if (!db) {
    console.error("Database instance not provided to initializeDatabase");
    return Promise.reject(new Error("No database instance provided"));
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      dropTables(db)
        .then(() => createTables(db))
        .then(() =>
          Promise.all([
            createDefaultUsers(db),
            createDefaultElements(db),
            createDefaultCards(db),
            createDefaultPacks(db),
            createDefaultPackCombinations(db),
          ])
        )
        .then(resolve)
        .catch((err) => {
          console.error("Error initializing database:", err);
          reject(err);
        });
    });
  });
};
