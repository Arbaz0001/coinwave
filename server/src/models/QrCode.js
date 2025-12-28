import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["UPI", "Crypto"],
      default: "UPI",
    },
  },
  { timestamps: true }
);

export default mongoose.model("QrCode", qrCodeSchema);
