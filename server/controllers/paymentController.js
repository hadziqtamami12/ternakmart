// paymentController.js - Dual-Mode Payment: Manual Bank Transfer & Gateway Webhook
const db = require('../database/adapter');
const notificationService = require('../services/notification');

exports.uploadTransferProof = async (req, res) => {
  try {
    const { order_id, proof_url } = req.body;

    if (!order_id || !proof_url) {
      return res.status(400).json({
        success: false,
        message: 'Mohon sertakan ID pesanan dan URL bukti transfer pembayaran.'
      });
    }

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    if (order.buyer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan mengunggah bukti untuk pesanan ini.' });
    }

    const fromStatus = order.payment_status;

    const updated = await db.update('orders', order_id, {
      payment_proof_url: proof_url,
      payment_status: 'AWAITING_APPROVAL'
    });

    // Record Audit Log
    await db.create('order_audit_logs', {
      order_id,
      actor_id: req.user.id,
      actor_role: req.user.role,
      from_status: `PAYMENT_${fromStatus}`,
      to_status: 'PAYMENT_AWAITING_APPROVAL',
      notes: `Pembeli mengunggah bukti struk transfer pembayaran manual.`,
      ip_address: req.ip || '127.0.0.1'
    });

    // Notify seller and admin
    const store = await db.findById('stores', order.store_id);
    if (store) {
      notificationService.send(store.user_id, {
        title: '💳 Bukti Transfer Diterima!',
        message: `Pembeli pesanan #${order.invoice_number} telah mengunggah bukti pembayaran. Mohon verifikasi rekening.`,
        type: 'PAYMENT_PROOF_UPLOADED',
        reference_id: order_id
      });
    }

    notificationService.send('usr_admin_001', {
      title: '💳 Verifikasi Pembayaran Manual',
      message: `Pesanan #${order.invoice_number} sebesar Rp ${order.grand_total.toLocaleString('id-ID')} menunggu verifikasi struk transfer.`,
      type: 'PAYMENT_PROOF_UPLOADED',
      reference_id: order_id
    });

    return res.json({
      success: true,
      message: 'Bukti transfer berhasil diunggah! Penjual dan Admin akan memvalidasi mutasi dana Anda.',
      data: updated
    });
  } catch (err) {
    console.error('uploadTransferProof error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses bukti pembayaran.' });
  }
};

exports.reviewPaymentProof = async (req, res) => {
  try {
    const { order_id, decision, notes } = req.body; // decision: 'APPROVE' | 'REJECT'

    if (!order_id || !['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Harap sertakan order_id dan keputusan (APPROVE/REJECT).' });
    }

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    // Must be admin or the store owner
    if (req.user.role !== 'ADMIN') {
      const store = await db.findById('stores', order.store_id);
      if (!store || store.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk mereview pembayaran pesanan ini.' });
      }
    }

    const isApproved = decision === 'APPROVE';
    const newPaymentStatus = isApproved ? 'PAID' : 'REJECTED';
    const newOrderStatus = isApproved ? 'HEALTH_INSPECTION' : order.status;

    const updated = await db.update('orders', order_id, {
      payment_status: newPaymentStatus,
      status: newOrderStatus
    });

    // Record Audit Log
    await db.create('order_audit_logs', {
      order_id,
      actor_id: req.user.id,
      actor_role: req.user.role,
      from_status: order.payment_status,
      to_status: newPaymentStatus,
      notes: isApproved
        ? `Pembayaran disetujui oleh ${req.user.name}. Pesanan diteruskan ke tahap inspeksi kesehatan & karantina.`
        : `Pembayaran ditolak oleh ${req.user.name}. Alasan: ${notes || 'Bukti transfer tidak valid atau dana belum masuk.'}`,
      ip_address: req.ip || '127.0.0.1'
    });

    // Notify Buyer
    notificationService.send(order.buyer_id, {
      title: isApproved ? '🎉 Pembayaran Dikonfirmasi!' : '❌ Pembayaran Ditolak',
      message: isApproved
        ? `Pembayaran untuk pesanan #${order.invoice_number} telah diverifikasi sah. Peternak mulai menyiapkan hewan ternak.`
        : `Pembayaran untuk pesanan #${order.invoice_number} ditolak. Catatan: ${notes || 'Silakan unggah ulang struk yang sah.'}`,
      type: isApproved ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
      reference_id: order_id
    });

    return res.json({
      success: true,
      message: isApproved ? 'Pembayaran berhasil disetujui!' : 'Pembayaran telah ditolak.',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mereview pembayaran.' });
  }
};

// Payment Gateway Simulator / Webhook Handler (Midtrans / Xendit ready)
exports.gatewayWebhook = async (req, res) => {
  try {
    const { order_id, transaction_status, gross_amount, fraud_status } = req.body;

    console.log('📡 [Payment Gateway Webhook received]:', req.body);

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    let isSuccess = false;
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        isSuccess = true;
      }
    }

    if (isSuccess) {
      await db.update('orders', order_id, {
        payment_status: 'PAID',
        status: 'HEALTH_INSPECTION'
      });

      await db.create('order_audit_logs', {
        order_id,
        actor_id: 'GATEWAY_MIDTRANS',
        actor_role: 'SYSTEM',
        from_status: order.payment_status,
        to_status: 'PAID',
        notes: `Pembayaran otomatis terverifikasi via QRIS/VA Payment Gateway senilai Rp ${gross_amount || order.grand_total}.`,
        ip_address: req.ip || '127.0.0.1'
      });

      notificationService.send(order.buyer_id, {
        title: '🎉 Pembayaran Gateway Sukses!',
        message: `Pembayaran QRIS/VA untuk pesanan #${order.invoice_number} berhasil diverifikasi secara real-time.`,
        type: 'PAYMENT_APPROVED',
        reference_id: order_id
      });
    }

    return res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false, message: 'Webhook processing failed.' });
  }
};
