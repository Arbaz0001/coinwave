import mongoose from "mongoose";

const adminBankAccountSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.Mixed, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountType: { type: String, enum: ["Savings", "Current", "Business"], default: "Savings" },
    isPrimary: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for faster queries
adminBankAccountSchema.index({ adminId: 1, isPrimary: -1 });

export default mongoose.model("AdminBankAccount", adminBankAccountSchema);
