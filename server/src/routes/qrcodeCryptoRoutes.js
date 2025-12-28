import express from "express";
import upload from "../middlewares/upload.js";
import {
  createCryptoQr,
  getCryptoQrs,
  deleteCryptoQr,
} from "../controllers/qrCryptoController.js";

const router = express.Router();

// ✅ Admin: Upload Crypto QR
router.post("/upload", upload.single("image"), createCryptoQr);

// ✅ User: Get all Crypto QRs
router.get("/all", getCryptoQrs);

// ✅ Admin: Delete Crypto QR
router.delete("/delete/:id", deleteCryptoQr);

export default router;
