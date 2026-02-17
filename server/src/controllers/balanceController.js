import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import ExchangeRate from "../models/ExchangeRate.js";
import Transaction from "../models/Transaction.js";

// ✅ Get user balance
export const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    res.json({ success: true, balance: wallet.balance });
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Set balance (admin only)
export const setUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (amount == null) {
      return res.status(400).json({ success: false, error: "Amount is required" });
    }

    let wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $set: { balance: amount } },
      { new: true, upsert: true }
    );

    const io = req.app?.get("io");
    if (io) {
      io.to(String(userId)).emit("balanceUpdated", {
        userId: String(userId),
        balance: wallet.balance,
      });
    }

    res.json({
      success: true,
      message: "Balance updated successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error setting balance:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Deposit balance
export const depositBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be positive" });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update wallet
    let wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      userId,
      userName: user.fullName,
      type: "upi", // default payment type
      transactionType: "deposit",
      amount,
      status: "success",
    });
    await transaction.save();

    // Socket.io emit for real-time update
    const io = req.app?.get("io");
    if (io) {
      io.to(String(userId)).emit("balanceUpdated", {
        userId: String(userId),
        balance: wallet.balance,
      });
    }

    res.json({
      success: true,
      message: "Deposit successful",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error depositing balance:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Withdraw balance
export const withdrawBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be positive" });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, error: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      userName: user.fullName,
      type: "upi", // default payment type
      transactionType: "withdraw",
      amount,
      status: "success",
    });
    await transaction.save();

    // Socket.io emit for real-time update
    const io = req.app?.get("io");
    if (io) {
      io.to(String(userId)).emit("balanceUpdated", {
        userId: String(userId),
        balance: wallet.balance,
      });
    }

    res.json({
      success: true,
      message: "Withdrawal successful",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error withdrawing balance:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Add INR Bonus to wallet (User can claim once)
export const addBonusToWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current exchange rates
    const exchangeRate = await ExchangeRate.findOne();
    if (!exchangeRate || !exchangeRate.inrBonus) {
      return res.status(400).json({
        success: false,
        message: "Bonus amount not configured by admin",
      });
    }

    const bonusAmount = exchangeRate.inrBonus;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add bonus to wallet
    let wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: bonusAmount } },
      { new: true, upsert: true }
    );

    // Socket.io emit for real-time update
    const io = req.app?.get("io");
    if (io) {
      io.to(String(userId)).emit("balanceUpdated", {
        userId: String(userId),
        balance: wallet.balance,
      });
    }

    res.status(200).json({
      success: true,
      message: `₹${bonusAmount.toFixed(2)} bonus added to your wallet!`,
      bonusAmount,
      newBalance: wallet.balance,
    });
  } catch (error) {
    console.error("Error adding bonus:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to add bonus", error: error.message });
  }
};
