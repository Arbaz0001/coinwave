import mongoose from "mongoose";
import Popup from "../models/Popup.js";
import PopupStatus from "../models/PopupStatus.js";

// Admin: create popup for a specific user
export const createPopup = async (req, res) => {
  try {
    const { userIds, title, message, link, buttonText, isActive } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !message) {
      return res.status(400).json({ success: false, message: "userIds (array), title and message are required" });
    }

    // validate objectIds
    for (const id of userIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: `Invalid userId: ${id}` });
    }

    const popup = await Popup.create({
      userIds,
      title,
      message,
      link: link || "",
      buttonText: buttonText || "Continue",
      isActive: isActive !== undefined ? isActive : true,
    });

    // Optionally emit via socket to target users
    const io = req.app.get("io");
    if (io) {
      for (const uid of userIds) {
        io.to(String(uid)).emit("popup.created", {
          _id: popup._id,
          title: popup.title,
          message: popup.message,
          createdAt: popup.createdAt,
        });
      }
    }

    return res.status(201).json({ success: true, data: popup });
  } catch (err) {
    console.error("createPopup error:", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// User: get active unseen popup for logged-in user
export const getUserPopup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // find active popups targeted to this user
    const popups = await Popup.find({ userIds: userId, isActive: true }).sort({ createdAt: -1 }).lean();
    if (!popups || popups.length === 0) return res.status(204).end();

    // find first popup that the user hasn't seen according to PopupStatus
    for (const p of popups) {
      const status = await PopupStatus.findOne({ popupId: p._id, userId });
      if (!status || (status && status.isSeen === false)) {
        return res.json({ success: true, data: p });
      }
    }

    return res.status(204).end();
  } catch (err) {
    console.error("getUserPopup error:", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// User: mark popup as seen (only owner)
export const markAsSeen = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const popupId = req.params.id;

    if (!popupId || !mongoose.Types.ObjectId.isValid(popupId)) {
      return res.status(400).json({ success: false, message: "Invalid popup id" });
    }

    const popup = await Popup.findById(popupId);
    if (!popup) return res.status(404).json({ success: false, message: "Popup not found" });
    // ensure user is targeted
    if (!popup.userIds.map(String).includes(String(userId))) return res.status(403).json({ success: false, message: "Forbidden" });

    // upsert PopupStatus
    const status = await PopupStatus.findOneAndUpdate(
      { popupId, userId },
      { isSeen: true, seenAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, data: status });
  } catch (err) {
    console.error("markAsSeen error:", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
