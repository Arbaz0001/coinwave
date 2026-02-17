import mongoose from "mongoose";

const { Schema } = mongoose;

const SellNotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, default: "Sell Notice" },
  message: { type: String, required: true },
  buttonText: { type: String, default: "Go to Help Support" },
  redirectUrl: { type: String, default: "/help-support" },
  type: { type: String, default: "sell_notification" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SellNotification || mongoose.model("SellNotification", SellNotificationSchema);
