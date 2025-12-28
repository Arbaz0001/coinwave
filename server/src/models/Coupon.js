import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  description: { type: String },
  discountPercent: { type: Number, default: 0 },
  discountFixed: { type: Number, default: 0 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  validFrom: { type: Date, default: Date.now },
  validTill: { type: Date },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who created
});

export default mongoose.model("Coupon", couponSchema);
