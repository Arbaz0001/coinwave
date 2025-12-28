import express from "express";
import { addNotification, getNotificationsForUser } from "../controllers/notificationController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin-only: create notification
router.post("/add", authMiddleware, isAdmin, addNotification);

// PUBLIC: let any user (logged-in or guest) fetch global notifications
// If you want targeted notifications for logged-in users, controller can still filter by userId query param.
router.get("/", getNotificationsForUser);

export default router;
