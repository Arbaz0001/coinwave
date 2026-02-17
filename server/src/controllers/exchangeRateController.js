import ExchangeRate from "../models/ExchangeRate.js";

// ✅ Get current exchange rates (public)
export const getExchangeRates = async (req, res) => {
  try {
    let rates = await ExchangeRate.findOne();
    
    // If no rates exist, create default ones
    if (!rates) {
      rates = await ExchangeRate.create({
        binancePrice: 0,
        waziraxPrice: 0,
        platformPrice: 0,
        inrBonusPercent: 0,
      });
    }

    res.json({
      success: true,
      data: {
        binancePrice: rates.binancePrice,
        waziraxPrice: rates.waziraxPrice,
        platformPrice: rates.platformPrice,
        inrBonusPercent: rates.inrBonusPercent,
        lastUpdated: rates.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch exchange rates",
    });
  }
};

// ✅ Update exchange rates (admin only) - supports percentage-based bonus
export const updateExchangeRates = async (req, res) => {
  try {
    const { binancePrice, waziraxPrice, platformPrice, inrBonusPercent } = req.body;

    console.log("🔍 updateExchangeRates called:");
    console.log("  req.user:", req.user);
    console.log("  body:", req.body);

    // Validate inputs
    if (
      binancePrice == null ||
      waziraxPrice == null ||
      platformPrice == null ||
      inrBonusPercent == null
    ) {
      return res.status(400).json({
        success: false,
        error: "All prices (including platform price) and bonus percentage must be provided",
      });
    }

    if (
      isNaN(binancePrice) ||
      isNaN(waziraxPrice) ||
      isNaN(platformPrice) ||
      isNaN(inrBonusPercent) ||
      binancePrice < 0 ||
      waziraxPrice < 0 ||
      platformPrice < 0 ||
      inrBonusPercent < 0 ||
      inrBonusPercent > 100
    ) {
      return res.status(400).json({
        success: false,
        error: "All prices must be non-negative, and bonus percentage must be between 0-100",
      });
    }

    let rates = await ExchangeRate.findOne();
    
    const adminId = req.user?._id || req.user?.id || null;
    console.log("✅ Admin ID:", adminId);

    // Validate and convert adminId if it's a valid ObjectId
    let validAdminId = null;
    if (adminId && typeof adminId === 'string') {
      // Check if it's a valid MongoDB ObjectId
      if (adminId.match(/^[0-9a-fA-F]{24}$/)) {
        validAdminId = adminId;
        console.log("✅ Valid ObjectId:", validAdminId);
      } else {
        console.log("⚠️ Invalid ObjectId format, leaving as null:", adminId);
      }
    }

    if (!rates) {
      rates = await ExchangeRate.create({
        binancePrice: Number(binancePrice),
        waziraxPrice: Number(waziraxPrice),
        platformPrice: Number(platformPrice),
        inrBonusPercent: Number(inrBonusPercent),
        updatedBy: validAdminId,
        lastUpdated: new Date(),
      });
    } else {
      rates.binancePrice = Number(binancePrice);
      rates.waziraxPrice = Number(waziraxPrice);
      rates.platformPrice = Number(platformPrice);
      rates.inrBonusPercent = Number(inrBonusPercent);
      rates.updatedBy = validAdminId;
      rates.lastUpdated = new Date();
      await rates.save();
    }

    console.log("✅ Rates updated successfully:", rates);

    res.json({
      success: true,
      message: "Exchange rates updated successfully",
      data: {
        binancePrice: rates.binancePrice,
        waziraxPrice: rates.waziraxPrice,
        platformPrice: rates.platformPrice,
        inrBonusPercent: rates.inrBonusPercent,
        lastUpdated: rates.lastUpdated,
      },
    });
  } catch (error) {
    console.error("❌ Error updating exchange rates:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to update exchange rates",
      details: error.message || String(error),
    });
  }
};

// ✅ Get USDT price (platform controlled)
export const getUSDTPrice = async (req, res) => {
  try {
    const rates = await ExchangeRate.findOne();
    
    if (!rates) {
      return res.json({
        success: true,
        data: {
          binancePrice: 0,
          waziraxPrice: 0,
          platformPrice: 0,
          averagePrice: 0,
        },
      });
    }

    const platformPrice = rates.platformPrice ?? 0;

    res.json({
      success: true,
      data: {
        binancePrice: rates.binancePrice,
        waziraxPrice: rates.waziraxPrice,
        platformPrice,
        averagePrice: platformPrice,
        lastUpdated: rates.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error getting USDT price:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get USDT price",
    });
  }
};

// ✅ Get INR Bonus percentage
export const getINRBonus = async (req, res) => {
  try {
    const rates = await ExchangeRate.findOne();
    
    res.json({
      success: true,
      data: {
        inrBonusPercent: rates?.inrBonusPercent ?? 0,
      },
    });
  } catch (error) {
    console.error("Error getting INR bonus:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get INR bonus",
    });
  }
};
