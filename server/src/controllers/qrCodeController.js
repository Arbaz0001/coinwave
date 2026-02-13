import fs from "fs";
import path from "path";
import QrCode from "../models/QrCode.js";

const BASE_PATH = "/api/uploads"; // consistent with your .env: VITE_API_URL=http://localhost:5000/api

/**
 * 🔹 Upload QR Image (Admin side)
 */
export const createQrCode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // ✅ Save correct image URL
    const imagePath = `${BASE_PATH}/${req.file.filename}`;

    const newQr = await QRCode.create({
      title: req.body.title || "UPI QR Code",
      imageUrl: imagePath,
    });

    return res.status(201).json({
      success: true,
      message: "QR Code uploaded successfully",
      data: newQr,
    });
  } catch (error) {
    console.error("Error in createQrCode:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload QR Code",
      error: error.message,
    });
  }
};

/**
 * 🔹 Fetch all QR codes
 */
export const getQrCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      message: "QR Codes fetched successfully",
      data: qrCodes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch QR Codes",
      error: error.message,
    });
  }
};

/**
 * 🔹 Delete QR Code by ID
 */
export const deleteQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const qr = await QRCode.findById(id);
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR Code not found",
      });
    }

    // ✅ Delete physical file
    const filePath = path.join(process.cwd(), "uploads", path.basename(qr.imageUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await qr.deleteOne();

    return res.json({
      success: true,
      message: "QR Code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting QR Code:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting QR Code",
      error: error.message,
    });
  }
};
