import mongoose from "mongoose";

const { Schema } = mongoose;

const SellHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true }, // USDT amount sold
  network: { type: String, required: true, enum: ["TRC20", "ERC20", "BEP20"] },
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
  },
  upiId: String,
  transactionHash: String,
  adminAddress: String,
  status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SellHistory || mongoose.model("SellHistory", SellHistorySchema);
