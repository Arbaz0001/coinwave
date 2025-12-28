import Wallet from "../models/Wallet.js";

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

    let wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

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

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, error: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

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
