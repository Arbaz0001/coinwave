import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // INR / USDT / ETH
    paymentMethod: { type: String, enum: ["UPI", "Bank"], default: "Bank" }, // How user wants to receive payment
    bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "UserBankAccount", default: null },
    upiId: { type: String, trim: true, default: null }, // Direct UPI ID entered by user
    details: { type: Object },
    remarks: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Withdraw", withdrawSchema);
