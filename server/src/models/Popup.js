import mongoose from "mongoose";

const { Schema } = mongoose;

const popupSchema = new Schema({
  userIds: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: "" },
  buttonText: { type: String, default: "Continue" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Popup", popupSchema);
