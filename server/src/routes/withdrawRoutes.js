// src/routes/withdrawRoutes.js
import express from "express";
import { createWithdraw, getAllWithdraws, updateWithdrawStatus, createUSDTSell } from "../controllers/withdrawController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🟢 Create withdraw (user side)
router.post("/create", createWithdraw);

// 🔴 Create USDT Sell Request (user side)
router.post("/usdt-sell", authMiddleware, createUSDTSell);

// 🔵 Get all withdraws (admin side)
router.get("/all", getAllWithdraws);

// 🟣 Update status (admin approve/reject)
router.put("/update/:id", updateWithdrawStatus);

export default router;
