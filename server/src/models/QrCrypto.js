import mongoose from "mongoose";

const qrCryptoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      enum: ["erc20", "trc20", "bep20"],
      required: true,
    },
    cryptoType: {
      type: String,
      enum: ["usdt"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QrCrypto", qrCryptoSchema);
