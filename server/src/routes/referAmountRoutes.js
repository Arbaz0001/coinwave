import express from "express";
import {
  getAllReferAmounts,
  getReferralStats,
  createReferAmount,
  updateReferAmount,
  deleteReferAmount,
} from "../controllers/referAmountController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /refer-amounts - Get all refer amounts
router.get("/refer-amount", getAllReferAmounts);

// GET /referral/stats - Get referral stats for current user
router.get("/referral/stats", authMiddleware, getReferralStats);

// POST /refer-amounts - Create new refer amount
router.post("/refer-amount", createReferAmount);

// PUT /refer-amounts/:id - Update refer amount
router.put("/refer-amount/:id", updateReferAmount);

// DELETE /refer-amounts/:id - Delete refer amount
router.delete("/refer-amount/:id", deleteReferAmount);

export default router;
