// server/src/models/withdrawModel.js
import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["UPI", "Crypto"], required: true },
    amount: { type: Number, required: true },
    details: { type: Object, default: {} },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Withdraw", withdrawSchema);
