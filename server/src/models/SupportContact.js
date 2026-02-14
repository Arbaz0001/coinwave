import mongoose from "mongoose";

const SupportContactSchema = new mongoose.Schema(
  {
    // Support contact information
    email: {
      type: String,
      required: false,
      default: "support@coinwave247.com",
    },
    phone: {
      type: String,
      required: false,
      default: "+91-1234567890",
    },
    telegram: {
      type: String,
      required: false,
      default: "https://t.me/coinwave247",
    },
    whatsapp: {
      type: String,
      required: false,
      default: "https://wa.me/911234567890",
    },

    // Additional info
    businessName: {
      type: String,
      required: false,
      default: "CoinWave247",
    },
    description: {
      type: String,
      required: false,
      default: "Your trusted cryptocurrency exchange platform",
    },

    // Metadata
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
    },
  },
  { 
    timestamps: true,
    collection: "supportcontacts"
  }
);

export default mongoose.model("SupportContact", SupportContactSchema);
