import QrCode from "../models/QrCode.js";

export const createQrCode = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "QR image is required",
      });
    }

    const qr = await QrCode.create({
      imageUrl: `/uploads/${req.file.filename}`,
      type: "UPI",
    });

    res.status(201).json({
      success: true,
      data: qr,
    });
  } catch (error) {
    next(error);
  }
};

export const getQrCodes = async (req, res) => {
  try {
    let qrs = [];

    try {
      qrs = await QrCode.find({}).sort({ createdAt: -1 });
    } catch (mongoError) {
      console.error("Mongo read error:", mongoError);
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: qrs,
    });
  } catch (error) {
    console.error("Fatal QR error:", error);
    res.json({ success: true, data: [] });
  }
};

export const deleteQrCode = async (req, res, next) => {
  try {
    await QrCode.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "QR deleted",
    });
  } catch (error) {
    next(error);
  }
};
