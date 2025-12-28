import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";

/**
 * 🟢 Create new withdrawal request
 */
export const createWithdraw = async (req, res) => {
  try {
    const { userId, amount, method, details, remarks } = req.body;

    if (!userId || !amount || !method) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const withdraw = await Withdraw.create({
      userId,
      amount,
      method,
      details,
      remarks,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdraw,
    });
  } catch (error) {
    console.error("❌ Withdraw create error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 🔵 Get all withdrawals (admin)
 */
export const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find().populate("userId", "name email");
    res.json({ success: true, data: withdraws });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch withdraws", error: error.message });
  }
};

/**
 * 🟣 Update withdrawal status (admin approve/reject)
 */
export const updateWithdrawStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const withdraw = await Withdraw.findById(id);
    if (!withdraw) return res.status(404).json({ success: false, message: "Withdrawal not found" });

    withdraw.status = status;
    await withdraw.save();

    // 💸 If approved → deduct from wallet
    if (status === "approved") {
      const wallet = await Wallet.findOne({ userId: withdraw.userId });
      if (wallet && wallet.balance >= withdraw.amount) {
        wallet.balance -= withdraw.amount;
        await wallet.save();
      }
    }

    res.json({ success: true, message: "Withdrawal status updated", data: withdraw });
  } catch (error) {
    console.error("❌ Update withdraw error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
