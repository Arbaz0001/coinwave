import express from "express";
import {
  getTransactions,
  approveTransaction,
  denyTransaction,
  updateTransaction,
  deleteTransaction,
  getAdminUserStatement,
  updateAdminStatementEntry,
  deleteAdminStatementEntry,
} from "../controllers/transactionController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get transactions
router.get("/", authMiddleware, isAdmin, getTransactions);

// ✅ Admin statement by user (merged source)
router.get("/admin/user/:userId", authMiddleware, isAdmin, getAdminUserStatement);

// ✅ Admin edit/delete statement entry by source
router.put("/admin-entry/:source/:id", authMiddleware, isAdmin, updateAdminStatementEntry);
router.delete("/admin-entry/:source/:id", authMiddleware, isAdmin, deleteAdminStatementEntry);

// ✅ Approve a transaction
router.put("/:id/approve", authMiddleware, isAdmin, approveTransaction);

// ✅ Deny a transaction
router.put("/:id/deny", authMiddleware, isAdmin, denyTransaction);

// ✅ Update transaction (Admin only)
router.put("/:id", authMiddleware, isAdmin, updateTransaction);

// ✅ Delete transaction (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteTransaction);

export default router;
