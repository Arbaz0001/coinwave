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
  getDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
  getQrCodes,
  deleteQrCode,
  getCryptoQrCodes,
  deleteCryptoQrCode,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ ADMIN LOGIN (public)
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  console.log("🟢 Admin login attempt:", identifier);

  if (!identifier || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Identifier and password required" 
    });
  }

  try {
    if (
      identifier === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { _id: "admin_controller", identifier, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("✅ Admin logged in successfully");

      return res.json({
        success: true,
        message: "Login successful",
        accessToken: token,
        user: { _id: "admin_controller", identifier, role: "admin" },
      });
    }

    return res.status(401).json({ 
      success: false,
      message: "Invalid credentials" 
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ✅ PROTECTED ROUTES (require authentication)
router.use(authMiddleware);

// ================== USER MANAGEMENT ==================
router.get("/users", permit("admin", "superadmin", "moderator"), getAllUsers);
router.put("/users/:id", permit("admin", "superadmin"), updateUser);
router.delete("/users/:id", permit("admin", "superadmin"), deleteUser);

// ================== WITHDRAWAL MANAGEMENT ==================
router.get("/withdrawals", permit("admin", "superadmin", "moderator"), getWithdrawals);
router.put("/withdrawals/:id/approve", permit("admin", "superadmin"), approveWithdrawal);
router.put("/withdrawals/:id/reject", permit("admin", "superadmin"), rejectWithdrawal);

// ================== DEPOSIT MANAGEMENT ==================
router.get("/deposits", permit("admin", "superadmin", "moderator"), getDepositRequests);
router.put("/deposits/:depositId/approve", permit("admin", "superadmin"), approveDepositRequest);
router.put("/deposits/:depositId/reject", permit("admin", "superadmin"), rejectDepositRequest);

// ================== QR CODE MANAGEMENT ==================
router.get("/qr-codes", permit("admin", "superadmin"), getQrCodes);
router.delete("/qr-codes/:qrId", permit("admin", "superadmin"), deleteQrCode);

router.get("/crypto-qr-codes", permit("admin", "superadmin"), getCryptoQrCodes);
router.delete("/crypto-qr-codes/:qrId", permit("admin", "superadmin"), deleteCryptoQrCode);

// ================== COUPON ==================
router.post("/coupon", permit("admin", "superadmin"), createCoupon);
// NOTE: Admin notification route removed per request — use existing Notification model usages elsewhere

export default router;

