const Notification = require('../models/Notification');

// Get notifications by wallet
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      walletAddress: req.params.walletAddress.toLowerCase(),
    }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { walletAddress: req.params.walletAddress.toLowerCase() },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };