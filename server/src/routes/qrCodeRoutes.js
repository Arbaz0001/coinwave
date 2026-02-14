import express from "express";
import upload from "../middlewares/upload.js";
import { createQrCode, getQrCodes, deleteQrCode } from "../controllers/qrCodeController.js";

const router = express.Router();

// POST: Upload QR code (Admin)
// Expects: multipart/form-data with field name "image"
router.post("/qr", upload.single("image"), createQrCode);

// GET: Fetch all QR codes
router.get("/qr-codes", getQrCodes);

// DELETE: Delete QR code by ID
router.delete("/delete-qr/:id", deleteQrCode);

export default router;
