import mongoose from "mongoose";
import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * 🔹 User submits UPI deposit request
 */
export const createUPIDeposit = async (req, res) => {
  try {
    const { userId, amount, transactionId, method, network, walletAddress, message } = req.body;

    // ✅ Validation
    if (!userId || !amount || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, amount, transactionId)",
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is ₹100",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid userId format" 
      });
    }

    // ✅ Check user exists
    const validUser = await User.findById(userId);
    if (!validUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Create deposit request
    let depositData = {
      userId,
      amount: Number(amount),
      method: method || "UPI", // Store the actual method (BUY_USDT, UPI, etc)
      status: "pending",
    };

    // 🔴 For BUY_USDT (crypto payments), store crypto details
    if (method === "BUY_USDT" && network && walletAddress) {
      depositData.cryptoDetails = {
        cryptoType: "USDT",
        network: network.toLowerCase(),
        transactionHash: transactionId,
        userReceivingWallet: walletAddress, // User's wallet to receive USDT
        timestamp: new Date(),
      };
      depositData.remarks = message;
    } else {
      // 🟢 For regular UPI deposits
      depositData.upiDetails = {
        transactionId,
        timestamp: new Date(),
      };
    }

    const newDeposit = await Deposit.create(depositData);

    console.log(`✅ Deposit created: ${newDeposit._id} for user ${userId}, Method: ${depositData.method}`);

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      data: newDeposit,
    });
  } catch (error) {
    console.error("❌ createUPIDeposit error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create deposit request",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 User submits Crypto deposit request
 */
export const createCryptoDeposit = async (req, res) => {
  try {
    const { userId, amount, cryptoType, network, transactionHash } = req.body;

    // ✅ Validation
    if (!userId || !amount || !cryptoType || !network || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, amount, cryptoType, network, transactionHash)",
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is ₹100",
      });
    }

    // ✅ Validate crypto type and network
    const validCryptoTypes = ["usdt"];
    const validNetworks = ["trc20", "erc20", "bep20"];

    if (!validCryptoTypes.includes(cryptoType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid crypto type. Only USDT supported.",
      });
    }

    if (!validNetworks.includes(network.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid network. Supported: trc20, erc20, bep20",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid userId format" 
      });
    }

    // ✅ Check user exists
    const validUser = await User.findById(userId);
    if (!validUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Create deposit request
    const newDeposit = await Deposit.create({
      userId,
      amount: Number(amount),
      method: "Crypto",
      cryptoDetails: {
        cryptoType: cryptoType.toUpperCase(),
        network: network.toLowerCase(),
        transactionHash,
        timestamp: new Date(),
      },
      status: "pending",
    });

    console.log(`✅ Crypto Deposit created: ${newDeposit._id} for user ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Crypto deposit request submitted successfully",
      data: newDeposit,
    });
  } catch (error) {
    console.error("❌ createCryptoDeposit error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create crypto deposit request",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Admin fetches all deposits (with filters)
 */
export const getAllDeposits = async (req, res) => {
  try {
    const { status, method, page, limit } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageSize;

    const deposits = await Deposit.find(filter)
      .populate("userId", "fullName email phoneNumber")
      .populate("approvedBy", "fullName email")
      .populate("rejectedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await Deposit.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    return res.json({
      success: true,
      data: deposits,
      totalCount,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("❌ getAllDeposits error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching deposits",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Admin gets single deposit
 */
export const getDepositById = async (req, res) => {
  try {
    const { depositId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid depositId format" 
      });
    }

    const deposit = await Deposit.findById(depositId)
      .populate("userId", "name email phoneNumber walletAddress")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email");

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    return res.json({ 
      success: true, 
      data: deposit,
    });
  } catch (error) {
    console.error("❌ getDepositById error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching deposit",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Admin approves deposit
 */
export const approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { remarks } = req.body;
    const adminId = req.user?._id || req.adminId;

    console.log("🔍 approveDeposit called with:", { depositId, adminId, userObj: req.user });

    if (!depositId) {
      return res.status(400).json({
        success: false,
        message: "Missing depositId",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid depositId format" 
      });
    }

    // ✅ Find deposit
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    // ✅ Check status
    if (deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve deposit with status: ${deposit.status}`,
      });
    }

    // ✅ Update deposit
    deposit.status = "approved";
    if (adminId) {
      deposit.approvedBy = adminId;
    }
    deposit.approvedAt = new Date();
    if (remarks) deposit.remarks = remarks;
    await deposit.save();

    // ✅ Update user's wallet
    let wallet = await Wallet.findOne({ userId: deposit.userId });
    if (!wallet) {
      wallet = await Wallet.create({ 
        userId: deposit.userId, 
        balance: 0 
      });
    }

    wallet.balance += Number(deposit.amount);
    await wallet.save();

    console.log(`✅ Deposit ${depositId} approved. Wallet updated: +${deposit.amount}`);

    // ✅ Create notification
    const notificationData = {
      title: "Deposit Approved ✅",
      message: `Your deposit of ₹${deposit.amount} has been approved and added to your wallet.`,
      userId: deposit.userId,
    };
    if (adminId) {
      notificationData.createdBy = adminId;
    }
    await Notification.create(notificationData);

    console.log(`✅ Deposit ${depositId} approved successfully`);

    return res.json({
      success: true,
      message: "Deposit approved successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("❌ approveDeposit error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve deposit",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Admin rejects deposit
 */
export const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?._id || req.adminId;

    if (!depositId || !adminId) {
      return res.status(400).json({
        success: false,
        message: "Missing depositId or admin identification",
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid depositId format" 
      });
    }

    // ✅ Find deposit
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    // ✅ Check status
    if (deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject deposit with status: ${deposit.status}`,
      });
    }

    // ✅ Update deposit
    deposit.status = "rejected";
    deposit.rejectedBy = adminId;
    deposit.rejectedAt = new Date();
    deposit.rejectionReason = rejectionReason;
    await deposit.save();

    console.log(`❌ Deposit ${depositId} rejected. Reason: ${rejectionReason}`);

    // ✅ Create notification
    await Notification.create({
      title: "Deposit Rejected ❌",
      message: `Your deposit of ₹${deposit.amount} was rejected. Reason: ${rejectionReason}`,
      userId: deposit.userId,
      createdBy: adminId,
    });

    return res.json({
      success: true,
      message: "Deposit rejected successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("❌ rejectDeposit error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject deposit",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Get user's deposits
 */
export const getUserDeposits = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid userId format" 
      });
    }

    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 });

    return res.json({ 
      success: true, 
      data: deposits,
      count: deposits.length,
    });
  } catch (error) {
    console.error("❌ getUserDeposits error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user deposits",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Admin deletes deposit
 */
export const deleteDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid depositId format" 
      });
    }

    const deposit = await Deposit.findByIdAndDelete(depositId);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    console.log(`✅ Deposit ${depositId} deleted`);

    return res.json({ 
      success: true, 
      message: "Deposit deleted successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("❌ deleteDeposit error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete deposit",
      error: error.message || String(error),
    });
  }
};

