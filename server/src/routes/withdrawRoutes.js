// src/routes/withdrawRoutes.js
import express from "express";
import { createWithdraw, getAllWithdraws, updateWithdrawStatus } from "../controllers/withdrawController.js";

const router = express.Router();

// 🟢 Create withdraw (user side)
router.post("/create", createWithdraw);

// 🔵 Get all withdraws (admin side)
router.get("/all", getAllWithdraws);

// 🟣 Update status (admin approve/reject)
router.put("/update/:id", updateWithdrawStatus);

export default router;
