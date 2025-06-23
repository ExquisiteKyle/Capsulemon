import express from "express";
import { getPackById, openPack } from "../../services/pack/index.js";
import { deductCredits } from "../../services/creditService.js";

const router = express.Router();

export default (db, { authenticateUser }) => {
  // Open a pack (requires authentication)
  router.post("/:packId/open", authenticateUser, async (req, res) => {
    try {
      const { packId } = req.params;
      const userId = req.user.id;

      // Get pack details to check cost
      const pack = await getPackById(db, packId);
      if (!pack) {
        return res.status(404).json({ error: "Pack not found" });
      }

      // Deduct credits first and get the result
      const creditResult = await deductCredits(db, userId, pack.cost);

      // Open the pack and get drawn cards
      const result = await openPack(db, userId, packId);

      res.json({
        success: true,
        pack: {
          id: result.packId,
          name: result.packName,
          cost: result.packCost,
        },
        drawnCards: result.drawnCards,
        creditsSpent: pack.cost,
        remainingCredits: creditResult.remainingCredits,
      });
    } catch (error) {
      if (error.message === "Insufficient credits") {
        return res.status(400).json({
          error: "Insufficient credits",
          required: pack.cost,
          current: req.user.credits,
        });
      }
      console.error("Error opening pack:", error);
      res.status(500).json({ error: "Failed to open pack" });
    }
  });

  return router;
};
