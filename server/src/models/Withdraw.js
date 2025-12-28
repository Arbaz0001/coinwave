import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // INR / USDT / ETH
    details: { type: Object },
    remarks: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Withdraw", withdrawSchema);
