// Function to get all elements
export const getAllElements = (db) =>
  new Promise((resolve, reject) => {
    db.all("SELECT * FROM elements", (err, rows) => {
      if (err) {
        console.error("Get elements DB error:", err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
