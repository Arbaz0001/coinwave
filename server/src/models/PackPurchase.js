import mongoose from "mongoose";

const packPurchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    packId: { type: mongoose.Schema.Types.ObjectId, ref: "Pack", required: true },
    amountPaid: { type: Number, required: true, min: 1 },
    interestAmount: { type: Number, default: 0 },
    totalReturn: { type: Number, default: 0 },
    paymentScreenshot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "", trim: true },
    approvedBy: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

packPurchaseSchema.index({ userId: 1, createdAt: -1 });
packPurchaseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("PackPurchase", packPurchaseSchema);
