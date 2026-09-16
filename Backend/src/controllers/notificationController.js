const Notification = require("../models/notification");

// =========================
// GET MY NOTIFICATIONS
// =========================

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId
    })
      .populate("sender", "name email")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

// =========================
// MARK ONE AS READ
// =========================

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: req.userId
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification"
    });
  }
};

// =========================
// MARK ALL AS READ
// =========================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications"
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};