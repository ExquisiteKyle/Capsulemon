import { createUser } from "./schema.js";

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

export const createDefaultCards = (db) => {
  if (!db) {
    return Promise.reject(
      new Error("Database instance not provided to createDefaultCards")
    );
  }

  const cards = [
    // Water cards
    {
      name: "Aqua Dragon",
      rarity: "Legendary",
      element: "Water",
      power: 95,
      image_url: null,
    },
    {
      name: "Tidal Wave",
      rarity: "Rare",
      element: "Water",
      power: 75,
      image_url: null,
    },
    {
      name: "Ocean Spirit",
      rarity: "Common",
      element: "Water",
      power: 45,
      image_url: null,
    },

    // Wind cards
    {
      name: "Storm Phoenix",
      rarity: "Legendary",
      element: "Wind",
      power: 90,
      image_url: null,
    },
    {
      name: "Gale Force",
      rarity: "Rare",
      element: "Wind",
      power: 70,
      image_url: null,
    },
    {
      name: "Breeze Elemental",
      rarity: "Common",
      element: "Wind",
      power: 40,
      image_url: null,
    },

    // Fire cards
    {
      name: "Inferno Demon",
      rarity: "Legendary",
      element: "Fire",
      power: 100,
      image_url: null,
    },
    {
      name: "Flame Burst",
      rarity: "Rare",
      element: "Fire",
      power: 80,
      image_url: null,
    },
    {
      name: "Ember Sprite",
      rarity: "Common",
      element: "Fire",
      power: 50,
      image_url: null,
    },

    // Earth cards
    {
      name: "Mountain Giant",
      rarity: "Legendary",
      element: "Earth",
      power: 85,
      image_url: null,
    },
    {
      name: "Stone Golem",
      rarity: "Rare",
      element: "Earth",
      power: 65,
      image_url: null,
    },
    {
      name: "Rock Elemental",
      rarity: "Common",
      element: "Earth",
      power: 35,
      image_url: null,
    },

    // Dark cards
    {
      name: "Shadow Lord",
      rarity: "Legendary",
      element: "Dark",
      power: 95,
      image_url: null,
    },
    {
      name: "Void Walker",
      rarity: "Rare",
      element: "Dark",
      power: 75,
      image_url: null,
    },
    {
      name: "Dark Imp",
      rarity: "Common",
      element: "Dark",
      power: 45,
      image_url: null,
    },

    // Holy cards
    {
      name: "Divine Angel",
      rarity: "Legendary",
      element: "Holy",
      power: 90,
      image_url: null,
    },
    {
      name: "Light Beam",
      rarity: "Rare",
      element: "Holy",
      power: 70,
      image_url: null,
    },
    {
      name: "Holy Spirit",
      rarity: "Common",
      element: "Holy",
      power: 40,
      image_url: null,
    },
  ];

  return Promise.all(
    cards.map(
      (card) =>
        new Promise((resolve, reject) => {
          // Get element ID first
          db.get(
            "SELECT id FROM elements WHERE name = ?",
            [card.element],
            (err, element) => {
              if (err) {
                console.error(
                  `Error getting element "${card.element}":`,
                  err.message
                );
                return reject(err);
              }
              if (!element) {
                console.error(`Element "${card.element}" not found`);
                return reject(new Error(`Element "${card.element}" not found`));
              }

              // Insert card
              db.run(
                "INSERT INTO cards (name, rarity, element_id, power, image_url) VALUES (?, ?, ?, ?, ?)",
                [
                  card.name,
                  card.rarity,
                  element.id,
                  card.power,
                  card.image_url,
                ],
                function (err) {
                  if (err) {
                    console.error(
                      `Error inserting card "${card.name}":`,
                      err.message
                    );
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            }
          );
        })
    )
  );
};

export const createDefaultPacks = (db) => {
  if (!db) {
    return Promise.reject(
      new Error("Database instance not provided to createDefaultPacks")
    );
  }

  const packs = [
    { name: "Starter Pack", cost: 50 },
    { name: "Premium Pack", cost: 100 },
    { name: "Legendary Pack", cost: 200 },
  ];

  return Promise.all(
    packs.map(
      (pack) =>
        new Promise((resolve, reject) => {
          db.run(
            "INSERT INTO packs (name, cost) VALUES (?, ?)",
            [pack.name, pack.cost],
            function (err) {
              if (err) {
                console.error(
                  `Error inserting pack "${pack.name}":`,
                  err.message
                );
                reject(err);
              } else {
                resolve({ id: this.lastID, name: pack.name, cost: pack.cost });
              }
            }
          );
        })
    )
  );
};

export const createDefaultPackCombinations = (db) => {
  if (!db) {
    return Promise.reject(
      new Error(
        "Database instance not provided to createDefaultPackCombinations"
      )
    );
  }

  return new Promise((resolve, reject) => {
    // Get all packs and cards
    db.all("SELECT id, name, cost FROM packs", (err, packs) => {
      if (err) {
        console.error("Error getting packs:", err.message);
        return reject(err);
      }

      db.all("SELECT id, name, rarity, element_id FROM cards", (err, cards) => {
        if (err) {
          console.error("Error getting cards:", err.message);
          return reject(err);
        }

        const combinations = [];

        packs.forEach((pack) => {
          cards.forEach((card) => {
            let dropRate = 5; // Default drop rate

            // Adjust drop rate based on rarity and pack type
            if (pack.name === "Starter Pack") {
              if (card.rarity === "Common") dropRate = 60;
              else if (card.rarity === "Rare") dropRate = 30;
              else if (card.rarity === "Legendary") dropRate = 10;
            } else if (pack.name === "Premium Pack") {
              if (card.rarity === "Common") dropRate = 40;
              else if (card.rarity === "Rare") dropRate = 45;
              else if (card.rarity === "Legendary") dropRate = 15;
            } else if (pack.name === "Legendary Pack") {
              if (card.rarity === "Common") dropRate = 20;
              else if (card.rarity === "Rare") dropRate = 40;
              else if (card.rarity === "Legendary") dropRate = 40;
            }

            combinations.push({
              packId: pack.id,
              cardId: card.id,
              dropRate,
            });
          });
        });

        // Insert all combinations
        Promise.all(
          combinations.map(
            (combo) =>
              new Promise((resolve, reject) => {
                db.run(
                  "INSERT INTO pack_combination (pack_id, card_id, drop_rate) VALUES (?, ?, ?)",
                  [combo.packId, combo.cardId, combo.dropRate],
                  (err) => {
                    if (err) {
                      console.error(
                        "Error inserting pack combination:",
                        err.message
                      );
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              })
          )
        )
          .then(resolve)
          .catch(reject);
      });
    });
  });
};
