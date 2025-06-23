import express from "express";
import {
  addCardToPack,
  getPackCards,
  updateCardInPack,
  removeCardFromPack,
} from "../../services/pack/index.js";

const router = express.Router();

export default (db, { authenticateUser, requireAdmin }) => {
  // Get all cards in a pack
  router.get("/:packId/cards", authenticateUser, (req, res) =>
    getPackCards(db, req.params.packId)
      .then((cards) => res.json(cards))
      .catch((error) => {
        console.error("Error fetching pack cards:", error);
        res.status(500).json({ error: "Failed to fetch pack cards" });
      })
  );

  // Add a card to a pack (admin only)
  router.post(
    "/:packId/cards/:cardId",
    authenticateUser,
    requireAdmin,
    (req, res) =>
      addCardToPack(db, {
        packId: req.params.packId,
        cardId: req.params.cardId,
        dropRate: req.body.dropRate,
      })
        .then((result) =>
          res.status(201).json({
            message: "Card added to pack successfully",
            combination: result,
          })
        )
        .catch((error) => {
          if (
            error.message === "Pack ID, card ID, and drop rate are required"
          ) {
            return res.status(400).json({ error: error.message });
          }
          console.error("Error adding card to pack:", error);
          res.status(500).json({ error: "Failed to add card to pack" });
        })
  );

  // Update a card in a pack (admin only)
  router.put(
    "/:packId/cards/:cardId",
    authenticateUser,
    requireAdmin,
    (req, res) =>
      updateCardInPack(db, req.params.packId, req.params.cardId, req.body)
        .then((result) =>
          res.json({
            message: "Pack combination updated successfully",
            combination: result,
          })
        )
        .catch((error) => {
          if (error.message === "Pack combination not found") {
            return res.status(404).json({ error: error.message });
          }
          if (error.message === "Drop rate must be provided") {
            return res.status(400).json({ error: error.message });
          }
          console.error("Error updating pack combination:", error);
          res.status(500).json({ error: "Failed to update pack combination" });
        })
  );

  // Remove a card from a pack (admin only)
  router.delete(
    "/:packId/cards/:cardId",
    authenticateUser,
    requireAdmin,
    (req, res) =>
      removeCardFromPack(db, req.params.packId, req.params.cardId)
        .then(() =>
          res.json({ message: "Card removed from pack successfully" })
        )
        .catch((error) => {
          if (error.message === "Pack combination not found") {
            return res.status(404).json({ error: error.message });
          }
          console.error("Error removing card from pack:", error);
          res.status(500).json({ error: "Failed to remove card from pack" });
        })
  );

  return router;
};
