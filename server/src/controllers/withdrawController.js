import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

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
 * 🔴 Create USDT Sell Request
 */
export const createUSDTSell = async (req, res) => {
  try {
    const { userId, usdtAmount, network, bankAccount, upiId, userSendingWallet, transactionHash, adminAddress, message } =
      req.body;

    // ✅ Validation
    if (!userId || !usdtAmount || !network || !bankAccount?.accountNumber || !upiId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, usdtAmount, network, bankAccount, upiId)",
      });
    }

    if (usdtAmount < 0.01) {
      return res.status(400).json({
        success: false,
        message: "Minimum USDT to sell is 0.01",
      });
    }

    // ✅ Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Create USDT sell request
    const sellRequest = await Withdraw.create({
      userId,
      amount: Number(usdtAmount),
      method: "USDT_SELL",
      details: {
        network: network.toLowerCase(),
        bankAccount: {
          accountNumber: bankAccount.accountNumber,
          ifscCode: bankAccount.ifscCode,
          accountHolderName: bankAccount.accountHolderName,
          bankName: bankAccount.bankName,
        },
        upiId,
        userSendingWallet, // User's wallet ADDRESS they're sending USDT FROM
        transactionHash,
        adminAddress,
        receivingAmount: usdtAmount, // Amount of USDT they're selling
      },
      remarks: message,
      status: "pending",
    });

    console.log(`✅ USDT Sell Request created: ${sellRequest._id} for user ${userId}`);

    return res.status(201).json({
      success: true,
      message: "USDT sell request submitted successfully",
      data: sellRequest,
    });
  } catch (error) {
    console.error("❌ createUSDTSell error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create USDT sell request",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔵 Get all withdrawals (admin)
 */
export const getAllWithdraws = async (req, res) => {
  try {
    const { status, method, page, limit } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageSize;

    const withdraws = await Withdraw.find(filter)
      .populate("userId", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await Withdraw.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      success: true,
      data: withdraws,
      totalCount,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdraws",
      error: error.message,
    });
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
