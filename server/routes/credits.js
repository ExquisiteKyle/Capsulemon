import express from "express";
import {
  getUserCredits,
  addCredits,
  getUserCreditsWithInfo,
} from "../services/creditService.js";

const router = express.Router();

export default (db, { authenticateUser }) => {
  // Get user credits
  router.get("/", authenticateUser, (req, res) =>
    getUserCredits(db, req.user.id)
      .then((credits) => res.json({ credits }))
      .catch((error) => {
        console.error("Error fetching user credits:", error);
        const status = error.message.includes("not found") ? 404 : 500;
        res.status(status).json({ error: error.message });
      })
  );

  // Get user info with credits
  router.get("/user-info", authenticateUser, (req, res) =>
    getUserCreditsWithInfo(db, req.user.id)
      .then((userInfo) => res.json(userInfo))
      .catch((error) => {
        console.error("Error fetching user info:", error);
        const status = error.message.includes("not found") ? 404 : 500;
        res.status(status).json({ error: error.message });
      })
  );

  // Purchase credits (fake payment)
  router.post("/purchase", authenticateUser, (req, res) => {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    // Simulate payment processing delay
    setTimeout(() => {
      // Simulate payment success (90% success rate)
      const paymentSuccess = Math.random() > 0.1;

      if (!paymentSuccess) {
        return res
          .status(402)
          .json({ error: "Payment failed. Please try again." });
      }

      // Add credits to user
      addCredits(db, req.user.id, amount)
        .then(() => getUserCreditsWithInfo(db, req.user.id))
        .then((userInfo) =>
          res.json({
            message: "Credits purchased successfully!",
            userInfo,
            transactionId: `TXN-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          })
        )
        .catch((error) => {
          console.error("Error adding credits:", error);
          res.status(500).json({ error: error.message });
        });
    }, 1500); // 1.5 second delay to simulate processing
  });

  return router;
};
