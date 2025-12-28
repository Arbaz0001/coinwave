import express from "express";
import {
  createDeposit,
  getAllDeposits,
  updateDepositStatus,
} from "../controllers/depositController.js";

const router = express.Router();

// 🔹 Create deposit (user)
router.post("/create", createDeposit);   // ✅ POST route only


// 🔹 Get all deposits (admin)
router.get("/all", getAllDeposits);

// 🔹 Update deposit status (admin)
router.put("/:depositId/status", updateDepositStatus);

export default router;
