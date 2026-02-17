import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  checkSellRestriction,
  submitSell,
  getSellHistory,
  getUserSellHistory,
  updateSellStatus,
} from "../controllers/sellController.js";

const router = express.Router();

// ✅ USER: Check if account has sell restriction
router.get("/check-restriction", authMiddleware, checkSellRestriction);

// ✅ USER: Submit a sell request
router.post("/submit", authMiddleware, submitSell);

// ✅ USER: Get own sell history
router.get("/history/me", authMiddleware, getUserSellHistory);

// ✅ ADMIN: Get all sell history
router.get("/history", authMiddleware, isAdmin, getSellHistory);

// ✅ ADMIN: Approve/Reject sell history entry
router.put("/history/:id/status", authMiddleware, isAdmin, updateSellStatus);

export default router;
