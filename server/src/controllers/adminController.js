import mongoose from "mongoose";
import Withdrawal from "../models/Withdraw.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Deposit from "../models/Deposit.js";
import QrCode from "../models/QrCode.js";
import QrCrypto from "../models/QrCrypto.js";
import Wallet from "../models/Wallet.js";
import ExchangeRate from "../models/ExchangeRate.js";
import Transaction from "../models/Transaction.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== WITHDRAWAL MANAGEMENT ==================

export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("user")
      .sort({ requestedAt: -1 });
    
    return res.json({ 
      success: true, 
      data: withdrawals,
      count: withdrawals.length,
    });
  } catch (err) {
    console.error("❌ getWithdrawals error:", err.message || err);
    return res.status(500).json({ 
      success: false,
      message: "Error fetching withdrawals",
      error: err.message || String(err),
    });
  }
};

export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ 
      success: false,
      message: "Withdrawal not found" 
    });
    if (w.status !== "requested") return res.status(400).json({ 
      success: false,
      message: "Invalid withdrawal status" 
    });

    w.status = "approved";
    w.processedAt = new Date();
    w.processedBy = req.user._id;
    w.adminNote = adminNote;
    await w.save();

    // Create notification
    await Notification.create({
      title: "Withdrawal Approved ✅",
      message: `Your withdrawal of ₹${w.amount} has been approved.`,
      userId: w.user,
      createdBy: req.user._id,
    });

    console.log(`✅ Withdrawal ${id} approved`);

    return res.json({ 
      success: true,
      message: "Withdrawal approved successfully",
      data: w 
    });
  } catch (err) {
    console.error("❌ approveWithdrawal error:", err.message || err);
    return res.status(500).json({ 
      success: false,
      message: "Error approving withdrawal",
      error: err.message || String(err),
    });
  }
};

export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ 
      success: false,
      message: "Withdrawal not found" 
    });

    w.status = "rejected";
    w.processedAt = new Date();
    w.processedBy = req.user._id;
    w.adminNote = adminNote;
    await w.save();

    // Create notification
    await Notification.create({
      title: "Withdrawal Rejected ❌",
      message: `Your withdrawal of ₹${w.amount} was rejected. Reason: ${adminNote || "Not specified"}`,
      userId: w.user,
      createdBy: req.user._id,
    });

    console.log(`❌ Withdrawal ${id} rejected`);

    return res.json({ 
      success: true,
      message: "Withdrawal rejected successfully",
      data: w 
    });
  } catch (err) {
    console.error("❌ rejectWithdrawal error:", err.message || err);
    return res.status(500).json({ 
      success: false,
      message: "Error rejecting withdrawal",
      error: err.message || String(err),
    });
  }
};

// ================== COUPON MANAGEMENT ==================

export const createCoupon = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;
    
    const coupon = await Coupon.create(data);
    
    console.log(`✅ Coupon created: ${coupon._id}`);

    return res.status(201).json({ 
      success: true,
      message: "Coupon created successfully",
      data: coupon 
    });
  } catch (err) {
    console.error("❌ createCoupon error:", err.message || err);
    return res.status(500).json({ 
      success: false,
      message: "Error creating coupon",
      error: err.message || String(err),
    });
  }
};

// ================== NOTIFICATION MANAGEMENT ==================

export const sendNotification = async (req, res) => {
  try {
    const { title, message, userId, isBroadcast } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message field is required",
      });
    }

    const notifData = {
      title: title || "Notification",
      message,
      createdBy: req.user._id,
    };

    if (isBroadcast) {
      notifData.userId = null; // Broadcast to all
    } else {
      notifData.userId = userId; // Send to specific user
    }

    const notification = await Notification.create(notifData);

    // Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      const payload = {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      };

      if (isBroadcast) {
        io.emit("notification", payload);
      } else {
        io.to(String(userId)).emit("notification", payload);
      }
    }

    console.log(`✅ Notification sent: ${notification._id}`);

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (err) {
    console.error("❌ sendNotification error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: err.message || String(err),
    });
  }
};

// ================== DEPOSIT MANAGEMENT ==================

export const getDepositRequests = async (req, res) => {
  try {
    const { status, method } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const deposits = await Deposit.find(filter)
      .populate("userId", "name email phoneNumber")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: deposits,
      count: deposits.length,
    });
  } catch (err) {
    console.error("❌ getDepositRequests error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error fetching deposit requests",
      error: err.message || String(err),
    });
  }
};

export const approveDepositRequest = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { remarks } = req.body;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve deposit with status: ${deposit.status}`,
      });
    }

    // Update deposit
    deposit.status = "approved";
    const rawAdminId = req.user?._id || req.user?.id || null;
    const adminObjectId = mongoose.Types.ObjectId.isValid(rawAdminId) ? rawAdminId : null;
    if (adminObjectId) {
      deposit.approvedBy = adminObjectId;
    }
    deposit.approvedAt = new Date();
    if (remarks) deposit.remarks = remarks;
    await deposit.save();

    // Get bonus percentage from ExchangeRate
    let exchangeRate = await ExchangeRate.findOne();
    const inrBonusPercent = exchangeRate?.inrBonusPercent || 0;
    
    // Calculate amounts
    const depositAmount = Number(deposit.amount);
    if (!Number.isFinite(depositAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit amount",
      });
    }
    
    const bonusAmount = Math.floor((depositAmount * inrBonusPercent) / 100);
    const totalAmount = depositAmount + bonusAmount;

    // Update wallet with deposit + bonus
    let wallet = await Wallet.findOne({ userId: deposit.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: deposit.userId, balance: 0 });
    }
    wallet.balance += totalAmount;
    await wallet.save();

    // Create bonus transaction record for statement
    if (bonusAmount > 0) {
      try {
        await Transaction.create({
          userId: deposit.userId,
          type: "upi",
          transactionType: "deposit",
          amount: bonusAmount,
          status: "success",
          details: {
            utr: `BONUS-${depositId}`,
          },
          approvedBy: adminObjectId,
        });
        console.log(`💰 Bonus transaction created: ₹${bonusAmount} (${inrBonusPercent}% of ₹${depositAmount})`);
      } catch (bonusError) {
        console.error("❌ Bonus transaction creation error:", bonusError.message || bonusError);
        // Don't fail approval if bonus transaction fails
      }
    }

    // Create notification with bonus info
    try {
      let notificationMessage = `Your deposit of ₹${depositAmount} (${deposit.method}) has been approved!`;
      if (bonusAmount > 0) {
        notificationMessage += ` 🎁 You received ₹${bonusAmount} bonus (${inrBonusPercent}%)! Total credited: ₹${totalAmount}`;
      }
      
      await Notification.create({
        title: bonusAmount > 0 ? "Deposit Approved + Bonus! 🎉" : "Deposit Approved ✅",
        message: notificationMessage,
        userId: deposit.userId,
        createdBy: adminObjectId || null,
      });
    } catch (notifError) {
      console.error("❌ approveDepositRequest notification error:", notifError.message || notifError);
      // don't fail approval if notification fails
    }

    console.log(`✅ Deposit ${depositId} approved. Amount: ₹${depositAmount}, Bonus: ₹${bonusAmount}, Total: ₹${totalAmount}`);

    return res.json({
      success: true,
      message: bonusAmount > 0 
        ? `Deposit approved! ₹${depositAmount} + ₹${bonusAmount} bonus = ₹${totalAmount} credited`
        : "Deposit approved successfully",
      data: {
        deposit,
        bonus: {
          percentage: inrBonusPercent,
          amount: bonusAmount,
          total: totalAmount,
        },
      },
    });
  } catch (err) {
    console.error("❌ approveDepositRequest error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error approving deposit",
      error: err.message || String(err),
    });
  }
};

export const rejectDepositRequest = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject deposit with status: ${deposit.status}`,
      });
    }

    // Update deposit
    deposit.status = "rejected";
    const rawAdminId = req.user?._id || req.user?.id || null;
    const adminObjectId = mongoose.Types.ObjectId.isValid(rawAdminId) ? rawAdminId : null;
    if (adminObjectId) {
      deposit.rejectedBy = adminObjectId;
    }
    deposit.rejectedAt = new Date();
    deposit.rejectionReason = rejectionReason;
    await deposit.save();

    // Create notification
    try {
      await Notification.create({
        title: "Deposit Rejected ❌",
        message: `Your deposit of ₹${deposit.amount} was rejected. Reason: ${rejectionReason}`,
        userId: deposit.userId,
        createdBy: adminObjectId || null,
      });
    } catch (notifError) {
      console.error("❌ rejectDepositRequest notification error:", notifError.message || notifError);
      // don't fail rejection if notification fails
    }

    console.log(`❌ Deposit ${depositId} rejected`);

    return res.json({
      success: true,
      message: "Deposit rejected successfully",
      data: deposit,
    });
  } catch (err) {
    console.error("❌ rejectDepositRequest error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error rejecting deposit",
      error: err.message || String(err),
    });
  }
};

// ================== QR CODE MANAGEMENT ==================

export const getQrCodes = async (req, res) => {
  try {
    const qrCodes = await QrCode.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: qrCodes,
      count: qrCodes.length,
    });
  } catch (err) {
    console.error("❌ getQrCodes error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error fetching QR codes",
      error: err.message || String(err),
    });
  }
};

export const deleteQrCode = async (req, res) => {
  try {
    const { qrId } = req.params;

    const qr = await QrCode.findByIdAndDelete(qrId);
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Delete file
    if (qr.imageUrl) {
      const uploadsDir = path.join(__dirname, "../../uploads");
      const filePath = path.join(uploadsDir, path.basename(qr.imageUrl));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ QR file deleted: ${filePath}`);
      }
    }

    console.log(`✅ QR code ${qrId} deleted`);

    return res.json({
      success: true,
      message: "QR code deleted successfully",
      data: qr,
    });
  } catch (err) {
    console.error("❌ deleteQrCode error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error deleting QR code",
      error: err.message || String(err),
    });
  }
};

export const getCryptoQrCodes = async (req, res) => {
  try {
    const cryptoQrs = await QrCrypto.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: cryptoQrs,
      count: cryptoQrs.length,
    });
  } catch (err) {
    console.error("❌ getCryptoQrCodes error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error fetching crypto QR codes",
      error: err.message || String(err),
    });
  }
};

export const deleteCryptoQrCode = async (req, res) => {
  try {
    const { qrId } = req.params;

    const qr = await QrCrypto.findByIdAndDelete(qrId);
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "Crypto QR code not found",
      });
    }

    // Delete file
    if (qr.imageUrl) {
      const uploadsDir = path.join(__dirname, "../../uploads");
      const filePath = path.join(uploadsDir, path.basename(qr.imageUrl));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Crypto QR file deleted: ${filePath}`);
      }
    }

    console.log(`✅ Crypto QR code ${qrId} deleted`);

    return res.json({
      success: true,
      message: "Crypto QR code deleted successfully",
      data: qr,
    });
  } catch (err) {
    console.error("❌ deleteCryptoQrCode error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Error deleting crypto QR code",
      error: err.message || String(err),
    });
  }
};
