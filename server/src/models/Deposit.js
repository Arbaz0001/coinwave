import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["UPI", "Crypto"], required: true },
    details: { type: Object },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Deposit", depositSchema);
