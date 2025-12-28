import mongoose from "mongoose";  
import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";


/**
 * 🔹 User submits deposit request
 */
export const createDeposit = async (req, res) => {
  try {
    const { userId, amount, method, details, remarks } = req.body;

    if (!userId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, amount, or method)",
      });
    }

    // ✅ Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId format" });
    }

    // ✅ Check if user actually exists in User collection
    const validUser = await User.findById(userId);
    if (!validUser) {
      return res.status(404).json({
        success: false,
        message: "User not found — Please log in with a valid user account",
      });
    }

    const newDeposit = await Deposit.create({
      userId,
      amount,
      method,
      details,
      remarks,
      status: "pending",
    });

    return res.json({
      success: true,
      message: "Deposit request created successfully",
      data: newDeposit,
    });
  } catch (error) {
    console.error("Create Deposit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating deposit",
      error: error.message,
    });
  }
};

/**
 * 🔹 Admin fetches all deposits
 */
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("userId", "name email").sort({ createdAt: -1 });
    return res.json({ success: true, data: deposits });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching deposits",
      error: error.message,
    });
  }
};

/**
 * 🔹 Admin approves or rejects deposit
 */
export const updateDepositStatus = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { status } = req.body;

    // 🧩 Validation
    if (!depositId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields: depositId or status" });
    }

    // 🔍 Find deposit
    const deposit = await Deposit.findById(depositId).populate("userId", "_id name email");
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    // 🧠 Ensure valid userId format
    const userId =
      typeof deposit.userId === "object" ? deposit.userId._id : deposit.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId format:", userId);
      return res.status(400).json({ success: false, message: "Invalid userId format" });
    }

    // 🔄 Update status
    deposit.status = status;
    await deposit.save();

    console.log(`🟩 Deposit ${status} for user: ${userId}`);

    // 🟢 If approved → update wallet balance
    if (status === "approved") {
      let wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        console.log("🆕 No wallet found, creating new wallet for user:", userId);
        wallet = await Wallet.create({ userId, balance: 0 });
      }

      wallet.balance += Number(deposit.amount);
      await wallet.save();

      console.log(`💰 Wallet updated successfully for user ${userId}. New balance: ${wallet.balance}`);
    }

    // 🔴 If rejected → no wallet change, just status update
    if (status === "rejected") {
      console.log(`❌ Deposit ${depositId} marked as rejected.`);
    }

    return res.json({
      success: true,
      message: `Deposit ${status} successfully`,
      data: deposit,
    });
  } catch (error) {
    console.error("❌ Error in updateDepositStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating deposit status",
      error: error.message,
    });
  }
};
