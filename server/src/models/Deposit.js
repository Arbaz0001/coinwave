import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    // User info
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Deposit amount
    amount: { 
      type: Number, 
      required: true,
      min: 100 
    },
    
    // Deposit method: UPI or Crypto or BUY_USDT
    method: { 
      type: String, 
      enum: ["UPI", "Crypto", "BUY_USDT"], 
      required: true 
    },
    
    // For UPI deposits
    upiDetails: {
      transactionId: String,  // User-provided txn ID
      timestamp: Date,
      upiId: String,          // Admin's UPI from QR
    },
    
    // For Crypto deposits
    cryptoDetails: {
      cryptoType: String,     // e.g., "usdt"
      network: String,        // e.g., "bep20", "trc20", "erc20"
      transactionHash: String, // Blockchain tx hash
      walletAddress: String,  // Admin's wallet (from QR)
      userWallet: String,     // User's sending wallet (optional)
      userReceivingWallet: String, // User's wallet where they want USDT sent
      timestamp: Date,
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    
    // Admin notes/remarks
    remarks: String,
    
    // Admin who approved/rejected
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Deposit", depositSchema);

