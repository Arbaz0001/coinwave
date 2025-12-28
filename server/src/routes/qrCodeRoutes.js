import express from "express";
import upload from "../middlewares/upload.js";
import { createQrCode, getQrCodes, deleteQrCode } from "../controllers/qrCodeController.js";

const router = express.Router();

// 🔹 Admin uploads QR image (use "qrCode" field for UPI)
router.post("/qr", upload.single("qrCode"), createQrCode);

// 🔹 Users fetch all QR images
router.get("/qr-codes", getQrCodes);

// 🔹 Delete QR Code
router.delete("/delete-qr/:id", deleteQrCode);

export default router;
