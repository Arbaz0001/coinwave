import mongoose from "mongoose";

const adminPaymentDetailsSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.Mixed, required: true },
    bankAccountDetails: { type: String, default: "", trim: true },
    upiId: { type: String, default: "", trim: true },
    qrCodeImage: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminPaymentDetailsSchema.index({ adminId: 1 }, { unique: true });

export default mongoose.model("AdminPaymentDetails", adminPaymentDetailsSchema);
