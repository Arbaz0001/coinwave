import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true,
      enum: [
        "minDeposit",
        "maxDeposit",
        "minWithdrawl",
        "maxWithdrawl",
        "minBuyUSDT",
        "minSellUSDT",
        "platformFeePercent"
      ]
    },
    value: { type: Number, required: true },
    description: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.Mixed }, // Can be ObjectId or string (for admin_controller)
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
