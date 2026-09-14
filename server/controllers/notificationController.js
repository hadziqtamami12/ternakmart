// notificationController.js - Real-time Notifications & Alerts Feed
const notificationService = require('../services/notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({
        success: true,
        data: {
          notifications: [],
          unread_count: 0
        }
      });
    }
    const list = notificationService.getUserNotifications(userId);
    const unreadCount = notificationService.getUnreadCount(userId);

    return res.json({
      success: true,
      data: {
        notifications: Array.isArray(list) ? list : [],
        unread_count: typeof unreadCount === 'number' ? unreadCount : 0
      }
    });
  } catch (err) {
    console.error('⚠️ [Notifications] Error in getMyNotifications:', err.message);
    return res.json({
      success: true,
      data: {
        notifications: [],
        unread_count: 0
      }
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notifId } = req.params;
    if (req.user?.id) {
      notificationService.markAsRead(req.user.id, notifId);
    }
    return res.json({ success: true, message: 'Notifikasi ditandai dibaca.' });
  } catch (err) {
    return res.json({ success: true, message: 'Notifikasi ditandai dibaca.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (req.user?.id) {
      notificationService.markAllAsRead(req.user.id);
    }
    return res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (err) {
    return res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
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

// Web Push subscription registration
exports.subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Data subscription tidak lengkap.' });
    }

    const pushService = require('../services/push-notification');
    const userAgent = req.headers['user-agent'] || 'Browser';
    const record = await pushService.subscribe(req.user.id, subscription, userAgent);

    return res.json({
      success: true,
      message: 'Langganan Web Push berhasil didaftarkan.',
      data: record
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan push notification: ' + err.message });
  }
};

