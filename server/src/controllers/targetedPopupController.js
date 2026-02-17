import mongoose from "mongoose";
import TargetedPopup from "../models/TargetedPopup.js";
import User from "../models/User.js";

// Admin: list users (simple, paginated)
export const listUsers = async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "50", 10));

    const filter = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { phoneNumber: regex }];
    }

    const users = await User.find(filter).select("_id fullName email role isVerified").limit(limit).skip((page - 1) * limit).lean();
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error("listUsers error:", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: create targeted popup for a single user
export const createTargetedPopup = async (req, res) => {
  try {
    const { userId, title, message, link, buttonText, isActive } = req.body;
    if (!userId || !title || !message) return res.status(400).json({ success: false, message: 'userId, title and message required' });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: 'Invalid userId' });

    const popup = await TargetedPopup.create({ userId, title, message, link: link || '', buttonText: buttonText || 'Done', isActive: isActive !== undefined ? isActive : true });
    return res.status(201).json({ success: true, data: popup });
  } catch (err) {
    console.error('createTargetedPopup error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User: get active unseen popup (single)
export const getUserPopup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const popup = await TargetedPopup.findOne({ userId, isActive: true, isSeen: false }).sort({ createdAt: -1 }).lean();
    if (!popup) return res.status(204).end();
    return res.json({ success: true, data: popup });
  } catch (err) {
    console.error('getUserPopup error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User: mark popup as seen and open link
export const markAsSeen = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const popupId = req.params.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!popupId || !mongoose.Types.ObjectId.isValid(popupId)) return res.status(400).json({ success: false, message: 'Invalid popup id' });

    const popup = await TargetedPopup.findById(popupId);
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    if (String(popup.userId) !== String(userId)) return res.status(403).json({ success: false, message: 'Forbidden' });

    popup.isSeen = true;
    await popup.save();

    return res.json({ success: true, data: popup });
  } catch (err) {
    console.error('markAsSeen error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
