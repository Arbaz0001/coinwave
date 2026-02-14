import mongoose from "mongoose";
import Notification from "../models/Notification.js";

/**
 * 🔹 Admin creates & sends notification
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, userId, isBroadcast } = req.body;
    const createdBy = req.user?._id || req.adminId;

    // ✅ Validation
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message field is required",
      });
    }

    // ✅ Build notification data
    const notificationData = {
      title: title || "Notification",
      message,
      createdBy,
    };

    // If not broadcast, require userId
    if (!isBroadcast) {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId required for non-broadcast notifications",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId format",
        });
      }

      notificationData.userId = userId;
    } else {
      notificationData.userId = null; // Broadcast to all
    }

    // ✅ Create notification
    const notification = await Notification.create(notificationData);

    console.log(`✅ Notification created: ${notification._id}`);

    // ✅ Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      if (isBroadcast) {
        // Broadcast to all connected clients
        io.emit("notification", {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
        });
      } else {
        // Send to specific user
        io.to(String(userId)).emit("notification", {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error) {
    console.error("❌ createNotification error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Get notifications for user
 */
export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    // Get notifications for this user (targeted + broadcast)
    const notifications = await Notification.find({
      $or: [
        { userId: null }, // Broadcast
        { userId: userId }, // Targeted to this user
      ],
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("❌ getNotificationsForUser error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Get all notifications (admin)
 */
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("userId", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("❌ getAllNotifications error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Mark notification as read by user
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;

    if (!notificationId || !userId) {
      return res.status(400).json({
        success: false,
        message: "notificationId and userId required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notificationId format",
      });
    }

    // Add userId to readBy if not already there
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("❌ markAsRead error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message || String(error),
    });
  }
};

/**
 * 🔹 Delete notification (admin only)
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notificationId format",
      });
    }

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    console.log(`✅ Notification ${notificationId} deleted`);

    return res.json({
      success: true,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    console.error("❌ deleteNotification error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message || String(error),
    });
  }
};
