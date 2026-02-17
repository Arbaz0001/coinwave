import express from "express";
import {
  getUserBalance,
  setUserBalance,
  depositBalance,
  withdrawBalance,
  addBonusToWallet,
} from "../controllers/balanceController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ User wallet balance routes (no auth required for getting balance)
router.get("/:userId", getUserBalance);             // Get user balance
router.put("/:userId/deposit", depositBalance);     // Deposit
router.put("/:userId/withdraw", withdrawBalance);   // Withdraw
router.post("/:userId/add-bonus", authMiddleware, addBonusToWallet); // Add INR bonus to wallet

// ✅ Admin-only route (requires JWT + admin role)
router.put("/admin/:userId/set", authMiddleware, isAdmin, setUserBalance);   // Admin set balance

export default router;
