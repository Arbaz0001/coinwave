import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "UPI QR Code",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["UPI", "Crypto"],
      default: "UPI",
    },
    upiId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QrCode", qrCodeSchema);
