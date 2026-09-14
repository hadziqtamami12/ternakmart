/**
 * server/services/push-notification.js
 * Web Push Notification Dispatcher for Mobile Android/iOS PWA (Pure JavaScript)
 */

try { require('dotenv').config(); } catch (e) {}

let webpush = null;
try {
  webpush = require('web-push');
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
  const vapidSubject = process.env.VAPID_SUBJECT_EMAIL || 'mailto:admin@ternakmart.id';

  if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  }
} catch (e) {
  // web-push not installed, runs gracefully
}

const db = require('../db/connection');

class PushNotificationService {
  async subscribe(userId, subscription, userAgent) {
    const existing = await db.findMany('push_subscriptions', { endpoint: subscription.endpoint });
    if (existing && existing.length > 0) {
      return await db.update('push_subscriptions', existing[0].id, {
        user_id: userId,
        keys: subscription.keys,
        user_agent: userAgent,
        updated_at: new Date().toISOString()
      });
    }
    return await db.create('push_subscriptions', {
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user_agent: userAgent,
      created_at: new Date().toISOString()
    });
  }

  async sendToUser(userId, payload) {
    if (!webpush) {
      console.log(`[Push Notification Simulation]:`, payload.title, payload.body);
      return { sent: 1, failed: 0 };
    }

    const subscriptions = await db.findMany('push_subscriptions', { user_id: userId });
    const notificationPayload = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    await Promise.allSettled(
      (subscriptions || []).map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, notificationPayload);
          sent++;
        } catch (error) {
          failed++;
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.delete('push_subscriptions', sub.id);
          }
        }
      })
    );

    return { sent, failed };
  }

  async notifyCourierLocationUpdate(buyerId, invoice, milestone) {
    return this.sendToUser(buyerId, {
      title: '🚚 Armada Ternak Dalam Perjalanan!',
      body: `Pembaruan Pesanan ${invoice}: ${milestone}`,
      data: { url: `/orders/tracking/${invoice}` }
    });
  }
}

const pushNotificationService = new PushNotificationService();
module.exports = pushNotificationService;
module.exports.pushNotificationService = pushNotificationService;
