// server/src/controllers/walletController.js
import Wallet from "../models/Wallet.js";
import Deposit from "../models/Deposit.js";

/**
 * 🔹 Get wallet balance by userId
 */
export const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    return res.json({
      success: true,
      message: "Wallet fetched successfully",
      data: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching wallet",
      error: error.message,
    });
  }
};

/**
 * 🔹 Add balance (Admin approves deposit)
 */
export const addBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    return res.json({
      success: true,
      message: "Balance added successfully",
      data: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding balance",
      error: error.message,
    });
  }
};

/**
 * 🔹 Deduct balance (Admin approves withdrawal)
 */
export const deductBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    wallet.balance -= Number(amount);
    await wallet.save();

    return res.json({
      success: true,
      message: "Balance deducted successfully",
      data: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deducting balance",
      error: error.message,
    });
  }
};
