import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { listUsers, createTargetedPopup, getUserPopup, markAsSeen } from "../controllers/targetedPopupController.js";

const router = express.Router();

// Admin: fetch users for sidebar (search & pagination)
router.get("/users", authMiddleware, isAdmin, listUsers);

// Admin: create popup for selected user
router.post("/", authMiddleware, isAdmin, createTargetedPopup);

// User: get active unseen popup
router.get("/me", authMiddleware, getUserPopup);

// User: mark as seen
router.post("/:id/seen", authMiddleware, markAsSeen);

export default router;
