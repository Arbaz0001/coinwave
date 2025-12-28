import express from "express";
import {
  getUserBalance,
  setUserBalance,
  depositBalance,
  withdrawBalance,
} from "../controllers/balanceController.js";

const router = express.Router();

// ✅ User wallet balance routes
router.get("/:userId", getUserBalance);             // Get user balance
router.put("/:userId/deposit", depositBalance);     // Deposit
router.put("/:userId/withdraw", withdrawBalance);   // Withdraw

// ✅ Admin-only route
router.put("/admin/:userId/set", setUserBalance);   // Admin set balance

export default router;
