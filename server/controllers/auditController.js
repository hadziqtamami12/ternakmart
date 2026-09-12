// auditController.js - Order Audit Logs with UTC & Dynamic Regional Timezone Conversion
const db = require('../database/adapter');
const { getActiveTimezone, formatWithTimezone } = require('../utils/timezone');

exports.getAuditLogs = async (req, res) => {
  try {
    const { order_id, actor_id, page = 1, limit = 20 } = req.query;
    let logs = await db.findMany('order_audit_logs', {});

    if (order_id) {
      logs = logs.filter(l => l.order_id === order_id);
    }
    if (actor_id) {
      logs = logs.filter(l => l.actor_id === actor_id);
    }

    logs.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

    const tzConfig = await getActiveTimezone();

    // Populate actor names & orders
    const populated = [];
    for (const log of logs) {
      const actor = await db.findById('users', log.actor_id);
      const order = await db.findById('orders', log.order_id);

      populated.push({
        ...log,
        actor_name: actor ? actor.name : (log.actor_id === 'GATEWAY_MIDTRANS' ? 'Payment Gateway' : 'Sistem'),
        invoice_number: order ? order.invoice_number : '-',
        recorded_at_utc: log.recorded_at,
        recorded_at_local: formatWithTimezone(log.recorded_at, tzConfig),
        timezone_applied: tzConfig.label
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const start = (pageNum - 1) * limitNum;
    const paginated = populated.slice(start, start + limitNum);

    return res.json({
      success: true,
      data: paginated,
      meta: {
        total: populated.length,
        page: pageNum,
        limit: limitNum,
        timezone: tzConfig.label
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat log audit pesanan.' });
  }
};
