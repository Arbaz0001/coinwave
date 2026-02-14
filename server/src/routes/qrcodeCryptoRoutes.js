import express from "express";
import upload from "../middlewares/upload.js";
import {
  createCryptoQr,
  getCryptoQrs,
  deleteCryptoQr,
} from "../controllers/qrCryptoController.js";

const router = express.Router();

// POST: Upload Crypto QR code (Admin)
// Expects: multipart/form-data with field name "image"
router.post("/upload", upload.single("image"), createCryptoQr);

// GET: Fetch all Crypto QR codes
router.get("/all", getCryptoQrs);

// DELETE: Delete Crypto QR code by ID
router.delete("/delete/:id", deleteCryptoQr);

export default router;
