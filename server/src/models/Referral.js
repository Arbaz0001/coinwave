import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bonusAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Referral", referralSchema);
