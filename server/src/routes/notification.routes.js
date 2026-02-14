import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createNotification,
  getNotificationsForUser,
  getAllNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ ADMIN: Create and broadcast notifications
router.post("/", authMiddleware, createNotification);

// ✅ ADMIN: Get all notifications
router.get("/all", authMiddleware, getAllNotifications);

// ✅ USER: Get notifications for current user
router.get("/user/:userId", authMiddleware, getNotificationsForUser);

// ✅ USER: Mark notification as read
router.put("/:notificationId/read", authMiddleware, markAsRead);

// ✅ ADMIN: Delete notification
router.delete("/:notificationId", authMiddleware, deleteNotification);

export default router;

