// notificationController.js - Real-time Notifications & Alerts Feed
const notificationService = require('../services/notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const list = notificationService.getUserNotifications(req.user.id);
    const unreadCount = notificationService.getUnreadCount(req.user.id);

    return res.json({
      success: true,
      data: {
        notifications: list,
        unread_count: unreadCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat notifikasi.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notifId } = req.params;
    notificationService.markAsRead(req.user.id, notifId);
    return res.json({ success: true, message: 'Notifikasi ditandai dibaca.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status notifikasi.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    notificationService.markAllAsRead(req.user.id);
    return res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi.' });
  }
};

// Simulation trigger for testing real-time sound alert & push
exports.triggerDemoNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notif = notificationService.send(req.user.id, {
      title: title || '🔔 Peringatan Ternakmart Real-Time',
      message: message || 'Pemberitahuan uji coba sistem notifikasi suara ding & push web.',
      type: type || 'DEMO_ALERT'
    });

    return res.json({
      success: true,
      message: 'Notifikasi uji coba berhasil dipicu!',
      data: notif
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memicu notifikasi.' });
  }
};
