import express from "express";
import {
  createPack,
  getAllPacks,
  getPackById,
  updatePack,
  deletePack,
} from "../../services/pack/index.js";

const router = express.Router();

export default (db, { authenticateUser, requireAdmin }) => {
  // Get all packs
  router.get("/", authenticateUser, (req, res) =>
    getAllPacks(db)
      .then((packs) => res.json(packs))
      .catch((error) => {
        console.error("Error fetching packs:", error);
        res.status(500).json({ error: "Failed to fetch packs" });
      })
  );

  // Get a specific pack
  router.get("/:packId", authenticateUser, (req, res) =>
    getPackById(db, req.params.packId)
      .then((pack) => res.json(pack))
      .catch((error) => {
        if (error.message === "Pack not found") {
          return res.status(404).json({ error: error.message });
        }
        console.error("Error fetching pack:", error);
        res.status(500).json({ error: "Failed to fetch pack" });
      })
  );

  // Create a new pack (admin only)
  router.post("/", authenticateUser, requireAdmin, (req, res) =>
    createPack(db, req.body)
      .then((result) =>
        res.status(201).json({
          message: "Pack created successfully",
          pack: result,
        })
      )
      .catch((error) => {
        if (error.message === "Name and cost are required for a pack") {
          return res.status(400).json({ error: error.message });
        }
        console.error("Error creating pack:", error);
        res.status(500).json({ error: "Failed to create pack" });
      })
  );

  // Update a pack (admin only)
  router.put("/:packId", authenticateUser, requireAdmin, (req, res) =>
    updatePack(db, req.params.packId, req.body)
      .then((result) =>
        res.json({
          message: "Pack updated successfully",
          pack: result,
        })
      )
      .catch((error) => {
        if (error.message === "Pack not found") {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message === "At least one field (name or cost) must be provided"
        ) {
          return res.status(400).json({ error: error.message });
        }
        console.error("Error updating pack:", error);
        res.status(500).json({ error: "Failed to update pack" });
      })
  );

  // Delete a pack (admin only)
  router.delete("/:packId", authenticateUser, requireAdmin, (req, res) =>
    deletePack(db, req.params.packId)
      .then(() => res.json({ message: "Pack deleted successfully" }))
      .catch((error) => {
        if (error.message === "Pack not found") {
          return res.status(404).json({ error: error.message });
        }
        console.error("Error deleting pack:", error);
        res.status(500).json({ error: "Failed to delete pack" });
      })
  );

  return router;
};
