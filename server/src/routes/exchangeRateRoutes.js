import { Router } from "express";
import {
  getExchangeRates,
  updateExchangeRates,
  getUSDTPrice,
  getINRBonus,
} from "../controllers/exchangeRateController.js";
import { verifyJWT, isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 PUBLIC ROUTES (any user can view rates)
router.get("/rates", getExchangeRates);              // Get all rates
router.get("/usdt-price", getUSDTPrice);            // Get USDT price (average)
router.get("/inr-bonus", getINRBonus);              // Get INR bonus

// 🔹 ADMIN ROUTES (only admin can update)
router.put("/rates/admin/update", verifyJWT, isAdmin, updateExchangeRates);

export default router;
