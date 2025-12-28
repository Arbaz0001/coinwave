import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, trim: true },

    // payment mode
    type: { type: String, enum: ["upi", "crypto"], required: true },

    // deposit / withdrawal
    transactionType: { type: String, enum: ["deposit", "withdraw"], required: true },

    amount: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    // extra details for tracking
    details: {
      upiId: { type: String, trim: true },
      utr: { type: String, trim: true }, // UPI transaction reference
      cryptoAddress: { type: String, trim: true },
      txHash: { type: String, trim: true }, // blockchain hash
    },

    // admin approval
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// indexes for faster queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ type: 1 });

export default mongoose.model("Transaction", transactionSchema);
