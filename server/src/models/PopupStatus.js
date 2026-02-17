import mongoose from "mongoose";

const { Schema } = mongoose;

const popupStatusSchema = new Schema({
  popupId: { type: Schema.Types.ObjectId, ref: "Popup", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  isSeen: { type: Boolean, default: false },
  seenAt: { type: Date, default: null }
}, { timestamps: true });

popupStatusSchema.index({ popupId: 1, userId: 1 }, { unique: true });

export default mongoose.model("PopupStatus", popupStatusSchema);
