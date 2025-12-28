import Withdrawal from "../models/Withdraw.js";
import Notification from "../models/Notification.js";
import Usermodel from "../models/user.js";
import Coupon from "../models/Coupon.js";

// Get pending withdrawals
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate("user").sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve withdrawal
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ message: "Withdrawal not found" });
    if (w.status !== "requested") return res.status(400).json({ message: "Invalid status" });

    w.status = "approved";
    w.processedAt = new Date();
    w.processedBy = req.user._id;
    w.adminNote = adminNote;
    await w.save();

    // Optionally create a notification
    await Notification.create({
      title: "Withdrawal Approved",
      message: `Your withdrawal of ${w.amount} has been approved.`,
      targetUsers: [w.user],
      createdBy: req.user._id,
      status: "pending",
    });

    res.json({ message: "Approved", withdrawal: w });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject withdrawal
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ message: "Withdrawal not found" });

    w.status = "rejected";
    w.processedAt = new Date();
    w.processedBy = req.user._id;
    w.adminNote = adminNote;
    await w.save();

    await Notification.create({
      title: "Withdrawal Rejected",
      message: `Your withdrawal of ${w.amount} was rejected. Reason: ${adminNote || "Not specified"}`,
      targetUsers: [w.user],
      createdBy: req.user._id,
      status: "pending",
    });

    res.json({ message: "Rejected", withdrawal: w });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Coupon (admin)
export const createCoupon = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;
    const coupon = await Coupon.create(data);
    res.json({ coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send Notification (admin)
export const sendNotification = async (req, res) => {
  try {
    const { title, message, targetUsers = [], isBroadcast = false, data = {} } = req.body;
    const notif = await Notification.create({
      title, message, targetUsers, isBroadcast, data, createdBy: req.user._id, status: "pending",
    });

    // TODO: integrate FCM server send here. For now we mark as pending/sent simulation.
    notif.status = "sent";
    notif.sentAt = new Date();
    await notif.save();

    res.json({ message: "Notification queued", notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
