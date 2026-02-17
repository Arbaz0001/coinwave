import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { createPopup, getUserPopup, markAsSeen } from "../controllers/popupController.js";
import User from "../models/User.js";

const router = express.Router();

// Admin creates popup for specific users
router.post("/", authMiddleware, isAdmin, createPopup);

// Admin: search users by name (case-insensitive)
router.get("/search-users", authMiddleware, isAdmin, async (req, res) => {
	try {
		const q = (req.query.search || "").trim();
		if (!q) return res.json({ success: true, data: [] });

		// simple case-insensitive partial match on name or email
		const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
		const users = await User.find({ $or: [{ fullName: regex }, { email: regex }, { phoneNumber: regex }] })
			.select("_id fullName email phoneNumber")
			.limit(50)
			.lean();

		return res.json({ success: true, data: users });
	} catch (err) {
		console.error("search-users error:", err.message || err);
		return res.status(500).json({ success: false, message: "Server error" });
	}
});

// User fetch their active unseen popup
router.get("/me", authMiddleware, getUserPopup);

// User mark popup as seen
router.post("/:id/seen", authMiddleware, markAsSeen);

export default router;
