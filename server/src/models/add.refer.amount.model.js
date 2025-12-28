import mongoose from "mongoose";

const referAmountSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ReferAmount", referAmountSchema);
export const ReferAmount = new mongoose.model("ReferAmount", referAmountSchema);
