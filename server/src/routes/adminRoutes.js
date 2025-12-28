import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware, isAdmin, isSuperAdmin } from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  createCoupon,
  sendNotification,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ NEW ROUTE: Admin login (public)
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  console.log("🟢 Incoming login:", identifier, password);
  console.log("🟣 ENV EMAIL:", process.env.ADMIN_EMAIL);
  console.log("🟣 ENV PASSWORD:", process.env.ADMIN_PASSWORD);
  console.log("🟣 ENV JWT SECRET:", process.env.JWT_SECRET);

  if (!identifier || !password)
    return res.status(400).json({ message: "Identifier and password required" });

  try {
    if (
      identifier === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { identifier, role: "admin" }, // ✅ removed admin._id
        process.env.JWT_SECRET, // ✅ make sure secret exists
        { expiresIn: "1d" }
      );

      return res.json({
        accessToken: token,
        user: { identifier, role: "admin" },
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("❌ Login crash:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ Protected routes (require authenticate & roles)
router.use(authMiddleware); // previously router.use(authenticate);

// Withdrawals routes
router.get(
  "/withdrawals",
  permit("admin", "superadmin", "moderator"),
  getWithdrawals
);
router.post(
  "/withdrawals/:id/approve",
  permit("admin", "superadmin"),
  approveWithdrawal
);
router.post(
  "/withdrawals/:id/reject",
  permit("admin", "superadmin"),
  rejectWithdrawal
);

// Coupon & Notification
router.post("/coupon", permit("admin", "superadmin"), createCoupon);
router.post("/notification", permit("admin", "superadmin"), sendNotification);

// Users routes
router.get("/users", permit("admin", "superadmin", "moderator"), getAllUsers);
router.put("/users/:id", permit("admin", "superadmin"), updateUser);
router.delete("/users/:id", permit("admin", "superadmin"), deleteUser);

export default router;
