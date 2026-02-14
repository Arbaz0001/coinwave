import QrCrypto from "../models/QrCrypto.js";

export const createCryptoQr = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Crypto QR image required",
      });
    }

    const network = req.body.network?.toLowerCase();
    const cryptoType = req.body.cryptoType?.toLowerCase();
    const address = req.body.address;

    if (!network || !cryptoType || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const qr = await QrCrypto.create({
      title: `${cryptoType.toUpperCase()} ${network.toUpperCase()}`,
      network,
      cryptoType,
      address,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      data: qr,
    });
  } catch (error) {
    console.error("❌ Error uploading crypto QR:", error);
    next(error);
  }
};


export const getCryptoQrs = async (req, res, next) => {
  try {
    const qrs = await QrCrypto.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: qrs || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCryptoQr = async (req, res, next) => {
  try {
    await QrCrypto.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Crypto QR deleted",
    });
  } catch (error) {
    next(error);
  }
};
