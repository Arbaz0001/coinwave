import express from "express";
import {
  getTransactions,
  approveTransaction,
  denyTransaction,
} from "../controllers/transactionController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get transactions
router.get("/", authMiddleware, isAdmin, getTransactions);

// ✅ Approve a transaction
router.put("/:id/approve", authMiddleware, isAdmin, approveTransaction);

// ✅ Deny a transaction
router.put("/:id/deny", authMiddleware, isAdmin, denyTransaction);

export default router;
