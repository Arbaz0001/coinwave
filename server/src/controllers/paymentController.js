// server/src/controllers/paymentController.js
import Payment from "../models/paymentModel.js";
import { addBalance } from "./walletController.js";

// ✅ User deposit request
export const createPayment = async (req, res) => {
  try {
    const { userId, method, amount, details } = req.body;

    if (!userId || !method || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const newPayment = new Payment({
      userId,
      method,
      amount,
      details,
      status: "pending",
    });

    await newPayment.save();

    res.json({
      success: true,
      message: "Deposit request created successfully. Waiting for admin approval.",
      data: newPayment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "email name");
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin approve/reject deposit
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // ✅ Agar approve ho to wallet balance add kare
    if (status === "approved") {
      await addBalance(payment.userId, payment.amount);
    }

    payment.status = status;
    await payment.save();

    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
