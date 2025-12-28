import express from "express";
import { getWallet, addBalance, deductBalance } from "../controllers/walletController.js";
import Wallet from "../models/Wallet.js";
const router = express.Router();

// walletRoutes.js
router.get("/crypto-qr-codes", async (req, res) => {
  try {
    const qrCodes = await CryptoQRModel.find(); // ya jo bhi model hai
    res.json({ success: true, data: qrCodes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch crypto QR codes" });
  }
});


// Fetch all wallets (for admin)
router.get("/all", async (req, res) => {
  try {
    const wallets = await Wallet.find();
    res.json({ success: true, data: wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching wallets" });
  }
});

// ✅ Get user wallet
router.get("/user/:userId", getWallet);


// ✅ Add balance (Admin use karega)
router.post("/add", addBalance);

// ✅ Deduct balance (Admin use karega)
router.post("/deduct", deductBalance);

export default router;
