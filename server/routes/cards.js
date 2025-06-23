import express from "express";
import {
  createCard,
  getCards,
  getAllCards,
  updateCard,
  deleteCard,
} from "../services/cardService.js";
import {
  assignCardToUser,
  getOwnedCards,
  removeCardFromUser,
  checkCardOwnership,
} from "../services/ownedCardService.js";

const router = express.Router();

export default (db, { authenticateUser, requireAdmin }) => {
  // Get all available cards (admin only)
  router.get("/all", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const cards = await new Promise((resolve, reject) => {
        db.all(
          `SELECT c.id, c.name, c.rarity, c.power, c.image_url, e.name as element_name 
           FROM cards c 
           JOIN elements e ON c.element_id = e.id
           ORDER BY c.name ASC`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      res.json(cards);
    } catch (error) {
      console.error("Error fetching all cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Get all available cards
  router.get("/", authenticateUser, async (req, res) => {
    try {
      const cards = await getAllCards(db);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Create a new card (admin only)
  router.post("/", requireAdmin, async (req, res) => {
    try {
      const result = await createCard(db, req.body);
      res.status(201).json({
        message: "Card created successfully",
        id: result.id,
      });
    } catch (error) {
      if (error.message === "Missing required card fields") {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating card:", error);
      res.status(500).json({ error: "Failed to create card" });
    }
  });

  // Get all cards owned by the authenticated user
  router.get("/owned", authenticateUser, async (req, res) => {
    try {
      const cards = await getOwnedCards(db, req.user.id);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching owned cards:", error);
      res.status(500).json({ error: "Failed to fetch owned cards" });
    }
  });

  // Assign a card to the authenticated user
  router.post("/:cardId/own", authenticateUser, async (req, res) => {
    try {
      const { cardId } = req.params;
      const quantity = parseInt(req.body.quantity) || 1;

      if (quantity <= 0) {
        res.status(400).json({ error: "Quantity must be greater than 0" });
        return;
      }

      const result = await assignCardToUser(db, req.user.id, cardId, quantity);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error assigning card:", error);
      res.status(500).json({ error: "Failed to assign card" });
    }
  });

  // Remove cards from the authenticated user's collection
  router.delete("/:cardId/own", authenticateUser, async (req, res) => {
    try {
      const { cardId } = req.params;
      const quantity = parseInt(req.body.quantity) || 1;

      if (quantity <= 0) {
        res.status(400).json({ error: "Quantity must be greater than 0" });
        return;
      }

      const result = await removeCardFromUser(
        db,
        req.user.id,
        cardId,
        quantity
      );
      res.status(200).json(result);
    } catch (error) {
      if (error.message === "Card not found in user's collection") {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error removing card:", error);
      res.status(500).json({ error: "Failed to remove card" });
    }
  });

  // Check if the authenticated user owns a specific card
  router.get("/:cardId/own/check", authenticateUser, async (req, res) => {
    try {
      const { cardId } = req.params;
      const result = await checkCardOwnership(db, req.user.id, cardId);
      res.json(result);
    } catch (error) {
      console.error("Error checking card ownership:", error);
      res.status(500).json({ error: "Failed to check card ownership" });
    }
  });

  // Update a card (admin only)
  router.put("/:cardId", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { cardId } = req.params;
      const result = await updateCard(db, cardId, req.body);

      res.json({
        message: "Card updated successfully",
        id: result.id,
      });
    } catch (error) {
      if (error.message === "Missing required card fields") {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error.message === "Card not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error updating card:", error);
      res.status(500).json({ error: "Failed to update card" });
    }
  });

  // Delete a card (admin only)
  router.delete(
    "/:cardId",
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const { cardId } = req.params;
        const result = await deleteCard(db, cardId);

        res.json({
          message: "Card deleted successfully",
          id: result.id,
        });
      } catch (error) {
        if (error.message === "Card not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Cannot delete card that is owned by users") {
          res.status(400).json({ error: error.message });
          return;
        }
        console.error("Error deleting card:", error);
        res.status(500).json({ error: "Failed to delete card" });
      }
    }
  );

  return router;
};
