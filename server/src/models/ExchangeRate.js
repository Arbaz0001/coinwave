import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema(
  {
    // USDT Prices from different exchanges
    binancePrice: {
      type: Number,
      default: 0,
      description: "USDT price from Binance in INR",
    },
    waziraxPrice: {
      type: Number,
      default: 0,
      description: "USDT price from Wazirax in INR",
    },

    // Platform price controlled by admin (not auto-calculated)
    platformPrice: {
      type: Number,
      default: 0,
      description: "Platform USDT price in INR set manually by admin",
    },
    
    // Platform Bonus (Percentage-based)
    inrBonusPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: "INR bonus percentage (0-100%) calculated on deposits/purchases",
    },

    // Metadata
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      description: "Admin who last updated prices",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExchangeRate", exchangeRateSchema);
