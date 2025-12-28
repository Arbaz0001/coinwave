// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Notification" },
    message: { type: String, required: true },
    // optional target: all or specific userId
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
