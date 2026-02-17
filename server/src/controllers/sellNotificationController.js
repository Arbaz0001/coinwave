import mongoose from "mongoose";
import SellNotification from "../models/SellNotification.js";

// Admin fetches all sell notifications
export const getAllSellNotifications = async (req, res) => {
  try {
    console.log("✅ [DEBUG] GET /api/sell-notification - Fetching all sell notifications");
    const notifications = await SellNotification.find()
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 });
    console.log(`✅ [DEBUG] Found ${notifications.length} sell notifications`);
    return res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("❌ [ERROR] getAllSellNotifications error", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin creates a sell notification for a user
export const createSellNotification = async (req, res) => {
  try {
    const { userId, title, message, buttonText, redirectUrl, isActive, type } = req.body;
    console.log("✅ [DEBUG] POST /api/sell-notification - Request body:", { userId, title, message, buttonText, redirectUrl, isActive, type });
    
    if (!userId || !message) {
      console.warn("⚠️ [DEBUG] Missing required fields: userId=" + userId + ", message=" + message);
      return res.status(400).json({ success: false, message: 'userId and message required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn("⚠️ [DEBUG] Invalid userId format:", userId);
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const existing = await SellNotification.findOne({ userId });
    if (existing) {
      console.log("✅ [DEBUG] Found existing notification, updating...");
      // update existing
      existing.title = title || existing.title;
      existing.message = message || existing.message;
      existing.buttonText = buttonText || existing.buttonText;
      existing.redirectUrl = redirectUrl || existing.redirectUrl;
      existing.isActive = isActive !== undefined ? isActive : existing.isActive;
      existing.type = type || existing.type;
      await existing.save();
      console.log("✅ [DEBUG] Existing notification updated:", existing._id);
      return res.json({ success: true, data: existing });
    }

    console.log("✅ [DEBUG] Creating new sell notification...");
    const sn = await SellNotification.create({ userId, title, message, buttonText, redirectUrl, isActive, type: type || 'sell_notification' });
    console.log("✅ [DEBUG] Sell notification created:", sn._id);
    return res.status(201).json({ success: true, data: sn });
  } catch (err) {
    console.error('❌ [ERROR] createSellNotification error', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const updateSellNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const data = req.body;
    const sn = await SellNotification.findByIdAndUpdate(id, data, { new: true });
    if (!sn) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: sn });
  } catch (err) {
    console.error('updateSellNotification error', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteSellNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const sn = await SellNotification.findByIdAndDelete(id);
    if (!sn) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteSellNotification error', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSellNotificationForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: 'Invalid userId' });
    const sn = await SellNotification.findOne({ userId });
    if (!sn) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: sn });
  } catch (err) {
    console.error('getSellNotificationForUser error', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check before sell for current logged in user
export const checkSellNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    console.log('🔍 [DEBUG] checkSellNotification - userId:', userId);
    if (!userId) {
      console.warn('⚠️ [DEBUG] No userId in token');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Query for active sell notification for this user
    const sn = await SellNotification.findOne({ userId, isActive: true }).lean();
    console.log('🔍 [DEBUG] Found sell notification:', sn ? 'YES' : 'NO', sn?._id);
    
    if (!sn) {
      console.log('📭 [DEBUG] No sell notification found, returning 204');
      return res.status(204).end();
    }
    
    console.log('✅ [DEBUG] Sell notification found, returning:', sn.title);
    return res.json({ success: true, data: sn });
  } catch (err) {
    console.error('❌ checkSellNotification error', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
