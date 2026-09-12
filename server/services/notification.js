// notification.js - In-App & Push Notification Dispatcher
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor() {
    this.notifications = [
      {
        id: 'notif_001',
        user_id: 'usr_seller_001',
        title: '🔔 Pesanan Baru Masuk!',
        message: 'Pesanan Sapi Limosin Super Jumbo 850kg telah dibayar, mohon siapkan dokumen SKKH & armada!',
        type: 'ORDER_PAID',
        reference_id: 'ord_demo_001',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif_002',
        user_id: 'usr_courier_001',
        title: '🚚 Penugasan Armada Baru',
        message: 'Anda ditugaskan menjemput Sapi Limosin di Kandang Barokah Farm tujuan Tebet, Jakarta Selatan.',
        type: 'COURIER_ASSIGNED',
        reference_id: 'ord_demo_001',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif_003',
        user_id: 'usr_buyer_001',
        title: '🌿 Rest Stop Checkpoint Pakan',
        message: 'Armada kurir sedang beristirahat memberi makan konsentrat & minum sapi Anda di Rest Area Jagorawi KM 45.',
        type: 'REST_STOP_CHECKPOINT',
        reference_id: 'ord_demo_001',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  getUserNotifications(userId) {
    return this.notifications
      .filter(n => n.user_id === userId || n.user_id === 'ALL')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getUnreadCount(userId) {
    return this.notifications.filter(n => (n.user_id === userId || n.user_id === 'ALL') && !n.is_read).length;
  }

  send(userId, { title, message, type = 'GENERAL', reference_id = null }) {
    const notif = {
      id: `notif_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
      user_id: userId,
      title,
      message,
      type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    // Keep max 200 notifications in memory
    if (this.notifications.length > 200) {
      this.notifications.pop();
    }
    return notif;
  }

  markAsRead(userId, notifId) {
    const notif = this.notifications.find(n => n.id === notifId && (n.user_id === userId || n.user_id === 'ALL'));
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  }

  markAllAsRead(userId) {
    this.notifications.forEach(n => {
      if (n.user_id === userId || n.user_id === 'ALL') {
        n.is_read = true;
      }
    });
    return true;
  }
}

module.exports = new NotificationService();
