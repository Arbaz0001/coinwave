import QrCrypto from "../models/QrCrypto.js";
import path from "path";
import { fileURLToPath } from "url";

// For proper path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔹 Upload Crypto QR Code (Admin)
 */
export const createCryptoQr = async (req, res) => {
  try {
    const { title, network, cryptoType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const qr = await QrCrypto.create({
      title,
      network,
      cryptoType,
      imageUrl,
    });

    res.json({
      success: true,
      message: "Crypto QR uploaded successfully",
      data: qr,
    });
  } catch (error) {
    console.error("❌ Error uploading crypto QR:", error.message);
    res.status(500).json({
      success: false,
      message: "Error uploading crypto QR",
      error: error.message,
    });
  }
};

/**
 * 🔹 Get All Crypto QRs (User side)
 */
export const getCryptoQrs = async (req, res) => {
  try {
    const qrs = await QrCrypto.find().sort({ createdAt: -1 });
    res.json({ success: true, data: qrs });
  } catch (error) {
    console.error("❌ Error fetching crypto QRs:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching crypto QRs",
      error: error.message,
    });
  }
};

/**
 * 🔹 Delete Crypto QR (Admin)
 */
export const deleteCryptoQr = async (req, res) => {
  try {
    const { id } = req.params;
    const qr = await QrCrypto.findByIdAndDelete(id);

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR not found" });
    }

    res.json({ success: true, message: "QR deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting crypto QR:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting crypto QR",
      error: error.message,
    });
  }
};
