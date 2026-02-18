import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    history: [
      {
        type: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        description: { type: String, default: "", trim: true },
        source: { type: String, default: "wallet", trim: true },
        referenceId: { type: mongoose.Schema.Types.Mixed, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
