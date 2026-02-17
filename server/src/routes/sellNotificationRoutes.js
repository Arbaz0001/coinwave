import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllSellNotifications,
  createSellNotification,
  updateSellNotification,
  deleteSellNotification,
  getSellNotificationForUser,
  checkSellNotification,
} from "../controllers/sellNotificationController.js";

const router = express.Router();

// Admin routes - Order matters! Specific routes before dynamic :id routes
router.get("/", authMiddleware, isAdmin, getAllSellNotifications);
router.post("/", authMiddleware, isAdmin, createSellNotification);

// User check route (must come before /:id)
router.get("/check", authMiddleware, checkSellNotification);

// Dynamic ID routes
router.get("/user/:userId", authMiddleware, isAdmin, getSellNotificationForUser);
router.put("/:id", authMiddleware, isAdmin, updateSellNotification);
router.delete("/:id", authMiddleware, isAdmin, deleteSellNotification);

export default router;
