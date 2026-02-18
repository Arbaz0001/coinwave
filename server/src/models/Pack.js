import mongoose from "mongoose";

const packSchema = new mongoose.Schema(
  {
    packName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    interestPercent: { type: Number, required: true, min: 0 },
    durationInDays: { type: Number, default: null },
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

packSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Pack", packSchema);
