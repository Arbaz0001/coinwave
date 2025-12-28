// server/src/models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["UPI", "Crypto"], required: true },
    amount: { type: Number, required: true },
    details: { type: Object },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
