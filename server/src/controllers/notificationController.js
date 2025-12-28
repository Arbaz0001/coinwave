// controllers/notificationController.js
import Notification from "../models/Notification.js";

// we will get io from req.app.get('io')
export const addNotification = async (req, res) => {
  try {
    const { message, title, userId } = req.body;
    if (!message) return res.status(400).json({ success:false, message: "Message required" });

    const n = await Notification.create({
      title: title || "Notification",
      message,
      userId: userId || null,
      createdBy: req.user?._id ?? null,
    });

    // Emit via Socket.IO (broadcast to all or to a room)
    const io = req.app.get("io");
    if (io) {
      if (userId) {
        // targeted user (if you implement rooms)
        io.to(String(userId)).emit("notification", n);
      } else {
        // broadcast to all connected clients
        io.emit("notification", n);
      }
    } else {
      console.warn("Socket.IO not available on req.app");
    }

    return res.status(201).json({ success: true, data: n });
  } catch (err) {
    console.error("addNotification:", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};


export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.query.userId ?? null;
    const filter = {};
    if (userId) {
      // notifications targeted to user OR global (userId null)
      filter.$or = [{ userId: null }, { userId }];
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};
