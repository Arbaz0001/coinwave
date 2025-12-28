import mongoose from "mongoose";

const pendingPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
  method: { type: String, enum: ["upi", "crypto"], required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("PendingPayment", pendingPaymentSchema);
