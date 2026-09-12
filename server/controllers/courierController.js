// courierController.js - Specialized Livestock Logistics, Fleet & Live GPS Tracking
const db = require('../database/adapter');
const notificationService = require('../services/notification');

exports.registerFleet = async (req, res) => {
  try {
    const { vehicle_type, plate_number, driver_name, phone_number } = req.body;

    if (!vehicle_type || !plate_number || !driver_name || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi jenis armada, nomor polisi, nama pengemudi, dan nomor telepon.'
      });
    }

    const newFleet = await db.create('courier_fleets', {
      user_id: req.user.id,
      vehicle_type, // 'PICKUP' | 'ENGKEL_TRUCK' | 'KARGO_HEWAN'
      plate_number,
      driver_name,
      phone_number,
      is_active: true
    });

    // Ensure role is COURIER
    if (req.user.role !== 'COURIER' && req.user.role !== 'ADMIN') {
      await db.update('users', req.user.id, { role: 'COURIER' });
    }

    return res.status(201).json({
      success: true,
      message: 'Armada kurir ternak berhasil didaftarkan!',
      data: newFleet
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan armada kurir.' });
  }
};

exports.getFleets = async (req, res) => {
  try {
    const fleets = await db.findMany('courier_fleets', { user_id: req.user.id });
    return res.json({ success: true, data: fleets });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat data armada.' });
  }
};

exports.acceptDelivery = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    const updated = await db.update('orders', order_id, {
      courier_id: req.user.id,
      status: 'DISPATCHED'
    });

    await db.create('order_audit_logs', {
      order_id,
      actor_id: req.user.id,
      actor_role: 'COURIER',
      from_status: order.status,
      to_status: 'DISPATCHED',
      notes: `Kurir ${req.user.name} menerima tugas pengantaran armada ternak.`,
      ip_address: req.ip || '127.0.0.1'
    });

    // Notify buyer
    notificationService.send(order.buyer_id, {
      title: '🚚 Kurir Siap Melakukan Penjemputan',
      message: `Kurir ${req.user.name} telah ditugaskan dan segera menjemput hewan ternak ke kandang.`,
      type: 'COURIER_ASSIGNED',
      reference_id: order_id
    });

    return res.json({
      success: true,
      message: 'Penugasan berhasil diterima.',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menerima penugasan kurir.' });
  }
};

exports.updateTrackingGps = async (req, res) => {
  try {
    const { order_id, latitude, longitude, status_label, notes, is_rest_stop, proof_photo_url } = req.body;

    if (!order_id || latitude === undefined || longitude === undefined || !status_label) {
      return res.status(400).json({
        success: false,
        message: 'Mohon sertakan order_id, latitude, longitude, dan label status posisi.'
      });
    }

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    // Auto set order status to IN_TRANSIT if dispatched
    if (order.status === 'DISPATCHED') {
      await db.update('orders', order_id, { status: 'IN_TRANSIT' });
      await db.update('animals', order.animal_id, { status: 'IN_TRANSIT' });
    }

    const trackingLog = await db.create('order_tracking_logs', {
      order_id,
      courier_id: req.user.id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status_label,
      notes: notes || '',
      is_rest_stop: Boolean(is_rest_stop),
      proof_photo_url: proof_photo_url || ''
    });

    // If rest stop checkpoint, record audit and notify buyer
    if (is_rest_stop) {
      await db.create('order_audit_logs', {
        order_id,
        actor_id: req.user.id,
        actor_role: 'COURIER',
        from_status: order.status,
        to_status: 'IN_TRANSIT',
        notes: `Rest stop checkpoint: ${status_label}. ${notes || 'Pemberian pakan konsentrat & istirahat hewan.'}`,
        ip_address: req.ip || '127.0.0.1'
      });

      notificationService.send(order.buyer_id, {
        title: '🌿 Checkpoint Istirahat & Pakan Ternak',
        message: `Armada berhenti sejenak untuk memberi makan/minum hewan di: ${status_label}.`,
        type: 'REST_STOP_CHECKPOINT',
        reference_id: order_id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Koordinat GPS dan status pelacakan berhasil diperbarui!',
      data: trackingLog
    });
  } catch (err) {
    console.error('updateTrackingGps error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui tracking armada.' });
  }
};

exports.finishHandover = async (req, res) => {
  try {
    const { order_id, proof_photo_url, notes, recipient_name } = req.body;

    if (!order_id || !proof_photo_url) {
      return res.status(400).json({
        success: false,
        message: 'Wajib mengunggah foto bukti serah terima hewan ternak hidup di lokasi penerima.'
      });
    }

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    const updated = await db.update('orders', order_id, {
      status: 'DELIVERED'
    });

    await db.update('animals', order.animal_id, { status: 'DELIVERED' });

    // Final tracking log
    await db.create('order_tracking_logs', {
      order_id,
      courier_id: req.user.id,
      latitude: order.dest_lat,
      longitude: order.dest_lng,
      status_label: `Hewan Ternak Hidup Berhasil Diterima oleh ${recipient_name || 'Pembeli'}`,
      notes: notes || 'Serah terima selesai dalam kondisi hidup, sehat, dan bugar.',
      is_rest_stop: false,
      proof_photo_url
    });

    await db.create('order_audit_logs', {
      order_id,
      actor_id: req.user.id,
      actor_role: 'COURIER',
      from_status: 'IN_TRANSIT',
      to_status: 'DELIVERED',
      notes: `Serah terima hewan berhasil di tujuan. Bukti serah terima tersimpan. Penerima: ${recipient_name || 'Pembeli'}.`,
      ip_address: req.ip || '127.0.0.1'
    });

    // Notify buyer & seller
    notificationService.send(order.buyer_id, {
      title: '🎉 Hewan Ternak Telah Tiba!',
      message: `Ternak Anda telah diserahterimakan dengan selamat. Silakan konfirmasi penyelesaian dan berikan ulasan!`,
      type: 'ORDER_DELIVERED',
      reference_id: order_id
    });

    const store = await db.findById('stores', order.store_id);
    if (store) {
      notificationService.send(store.user_id, {
        title: '✅ Pengantaran Berhasil Selesai',
        message: `Pesanan #${order.invoice_number} telah tiba di alamat pembeli dengan aman.`,
        type: 'ORDER_DELIVERED',
        reference_id: order_id
      });
    }

    return res.json({
      success: true,
      message: 'Serah terima hewan ternak berhasil diselesaikan!',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menyelesaikan serah terima.' });
  }
};
