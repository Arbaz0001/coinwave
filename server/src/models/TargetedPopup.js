import mongoose from "mongoose";

const { Schema } = mongoose;

const TargetedPopupSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: "" },
  buttonText: { type: String, default: "Done" },
  isActive: { type: Boolean, default: true },
  isSeen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.TargetedPopup || mongoose.model("TargetedPopup", TargetedPopupSchema);
