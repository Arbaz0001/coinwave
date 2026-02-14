import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createUPIDeposit,
  createCryptoDeposit,
  getAllDeposits,
  getDepositById,
  approveDeposit,
  rejectDeposit,
  getUserDeposits,
  deleteDeposit,
} from "../controllers/depositController.js";

const router = express.Router();

// ✅ USER ROUTES (require authentication)
// Create deposit requests
router.post("/upi", authMiddleware, createUPIDeposit);
router.post("/crypto", authMiddleware, createCryptoDeposit);

// Get user's own deposits
router.get("/user/:userId", authMiddleware, getUserDeposits);

// ✅ ADMIN ROUTES (require authentication)
// Get all deposits
router.get("/all", authMiddleware, getAllDeposits);

// Get single deposit
router.get("/:depositId", authMiddleware, getDepositById);

// Approve deposit
router.put("/:depositId/approve", authMiddleware, approveDeposit);

// Reject deposit
router.put("/:depositId/reject", authMiddleware, rejectDeposit);

// Delete deposit
router.delete("/:depositId", authMiddleware, deleteDeposit);

export default router;

