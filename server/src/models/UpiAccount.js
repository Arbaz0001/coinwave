import mongoose from "mongoose";

const upiAccountSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    upiId: { 
      type: String, 
      required: true,
      trim: true,
    },
    upiName: { 
      type: String, 
      required: true,
      trim: true,
    },
    provider: { 
      type: String, 
      enum: ["Paytm", "PhonePe", "GooglePay", "BHIM", "Other"],
      default: "Other" 
    },
    isPrimary: { 
      type: Boolean, 
      default: false 
    },
    verified: { 
      type: Boolean, 
      default: false 
    },
    notes: { 
      type: String, 
      default: "" 
    },
  },
  { timestamps: true }
);

// Index for faster queries
upiAccountSchema.index({ userId: 1, isPrimary: -1 });

export default mongoose.model("UpiAccount", upiAccountSchema);
