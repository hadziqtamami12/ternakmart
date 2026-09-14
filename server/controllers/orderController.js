// orderController.js - Order Creation, Pricing Formula, Audit Logging & Status Progression
const db = require('../database/adapter');
const notificationService = require('../services/notification');

// Haversine distance calculator in KM
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate livestock shipping rate based on dynamic settings, distance, and animal category/weight
async function estimateShippingRate(distanceKm, weightKg, category) {
  let baseFee = 20000;
  let perKmFee = 4000;
  try {
    const settings = await db.findMany('shipping_settings', {});
    if (settings.length > 0 && settings[0].goternak_base_fee !== undefined) {
      baseFee = parseFloat(settings[0].goternak_base_fee);
      perKmFee = parseFloat(settings[0].goternak_per_km_fee);
    }
  } catch (e) {}

  // Adjust for heavy animal transport handling
  let multiplier = 1.0;
  if (category === 'SAPI' || category === 'KERBAU' || weightKg > 300) {
    multiplier = 2.0; // Specialized truck with partition & water spray
  } else if (category === 'DOMBA' || category === 'KAMBING') {
    multiplier = 1.25;
  }

  const calculated = Math.round(baseFee + (distanceKm * perKmFee * multiplier));
  return Math.max(baseFee, calculated);
}

exports.calculateEstimate = async (req, res) => {
  try {
    const { animal_id, dest_lat, dest_lng, voucher_code, logistics_type } = req.body;

    const animal = await db.findById('animals', animal_id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    const store = await db.findById('stores', animal.store_id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Data toko peternak tidak ditemukan.' });
    }

    // Distance calculation
    const userLat = dest_lat || req.user.latitude || -6.2088;
    const userLng = dest_lng || req.user.longitude || 106.8456;
    const distanceKm = Math.round(calculateDistanceKm(store.latitude, store.longitude, userLat, userLng) * 10) / 10;

    const base_price = parseFloat(animal.price);
    const store_discount = 0; // Can be enhanced with store promo
    let admin_discount = 0;
    let shipping_subsidy = 0;

    // Shipping calculation
    let shipping_fee = await estimateShippingRate(distanceKm, animal.weight_kg, animal.category);

    // Fetch shipping settings for third party options
    let shippingSettings = null;
    try {
      const s = await db.findMany('shipping_settings', {});
      if (s.length > 0) shippingSettings = s[0];
    } catch (e) {}

    // Check Voucher
    if (voucher_code) {
      const vouchers = await db.findMany('vouchers', { voucher_code: voucher_code.toUpperCase() });
      if (vouchers.length > 0) {
        const vch = vouchers[0];
        const now = new Date().toISOString();
        if (now >= vch.start_time && now <= vch.end_time && vch.used_count < vch.quota && base_price >= vch.min_purchase) {
          if (vch.is_shipping_subsidy) {
            shipping_subsidy = Math.min(parseFloat(vch.discount_value), shipping_fee);
          } else {
            if (vch.discount_type === 'PERCENT') {
              const calc = (base_price * parseFloat(vch.discount_value)) / 100;
              admin_discount = vch.max_discount_cap ? Math.min(calc, vch.max_discount_cap) : calc;
            } else {
              admin_discount = parseFloat(vch.discount_value);
            }
          }
        }
      }
    }

    // Fetch dynamic service fee from settings
    let service_fee = 35000;
    const settings = await db.findMany('system_settings', { key_name: 'platform_identity' });
    if (settings.length > 0 && settings[0].value_json && settings[0].value_json.service_fee_nominal !== undefined) {
      service_fee = parseFloat(settings[0].value_json.service_fee_nominal);
    }

    // Grand total formula
    const grand_total = (base_price - store_discount - admin_discount) +
      (shipping_fee - shipping_subsidy) +
      service_fee;

    return res.json({
      success: true,
      data: {
        base_price,
        store_discount,
        admin_discount,
        shipping_fee,
        shipping_subsidy,
        service_fee,
        grand_total,
        distance_km: distanceKm,
        shipping_settings: shippingSettings,
        store_location: { latitude: store.latitude, longitude: store.longitude, farm_address: store.farm_address },
        destination: { latitude: userLat, longitude: userLng }
      }
    });
  } catch (err) {
    console.error('calculateEstimate error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengkalkulasi estimasi biaya checkout.' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      animal_id,
      payment_method,
      delivery_address,
      dest_lat,
      dest_lng,
      logistics_type,
      voucher_code
    } = req.body;

    if (!animal_id || !delivery_address) {
      return res.status(400).json({ success: false, message: 'Mohon lengkapi ID hewan ternak dan alamat tujuan.' });
    }

    const animal = await db.findById('animals', animal_id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    if (animal.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Hewan ternak sudah tidak berstatus tersedia.' });
    }

    const store = await db.findById('stores', animal.store_id);

    // Calculate rates
    const userLat = dest_lat ? parseFloat(dest_lat) : (req.user.latitude || -6.2088);
    const userLng = dest_lng ? parseFloat(dest_lng) : (req.user.longitude || 106.8456);
    const distanceKm = Math.round(calculateDistanceKm(store.latitude, store.longitude, userLat, userLng) * 10) / 10;

    const base_price = parseFloat(animal.price);
    const store_discount = 0;
    let admin_discount = 0;
    let shipping_subsidy = 0;

    const shipping_fee = estimateShippingRate(distanceKm, animal.weight_kg, animal.category);

    // Voucher handling
    let appliedVoucherId = null;
    if (voucher_code) {
      const vouchers = await db.findMany('vouchers', { voucher_code: voucher_code.toUpperCase() });
      if (vouchers.length > 0) {
        const vch = vouchers[0];
        const now = new Date().toISOString();
        if (now >= vch.start_time && now <= vch.end_time && vch.used_count < vch.quota && base_price >= vch.min_purchase) {
          appliedVoucherId = vch.id;
          if (vch.is_shipping_subsidy) {
            shipping_subsidy = Math.min(parseFloat(vch.discount_value), shipping_fee);
          } else {
            if (vch.discount_type === 'PERCENT') {
              const calc = (base_price * parseFloat(vch.discount_value)) / 100;
              admin_discount = vch.max_discount_cap ? Math.min(calc, vch.max_discount_cap) : calc;
            } else {
              admin_discount = parseFloat(vch.discount_value);
            }
          }
          // Increment voucher usage
          await db.update('vouchers', vch.id, { used_count: (vch.used_count || 0) + 1 });
        }
      }
    }

    let service_fee = 35000;
    const settings = await db.findMany('system_settings', { key_name: 'platform_identity' });
    if (settings.length > 0 && settings[0].value_json && settings[0].value_json.service_fee_nominal !== undefined) {
      service_fee = parseFloat(settings[0].value_json.service_fee_nominal);
    }

    const grand_total = (base_price - store_discount - admin_discount) +
      (shipping_fee - shipping_subsidy) +
      service_fee;

    // Unique invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoice_number = `INV-TNK-${dateStr}-${randomSuffix}`;
    const tracking_number = `TRK-TNK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await db.create('orders', {
      invoice_number,
      buyer_id: req.user.id,
      store_id: store.id,
      animal_id: animal.id,
      base_price,
      store_discount,
      admin_discount,
      shipping_fee,
      shipping_subsidy,
      service_fee,
      grand_total,
      payment_method: payment_method || 'MANUAL_TRANSFER',
      payment_status: 'UNPAID',
      payment_proof_url: '',
      status: 'AWAITING_PAYMENT',
      courier_id: null,
      logistics_type: logistics_type || 'OFFICIAL_COURIER',
      tracking_number,
      delivery_address,
      dest_lat: userLat,
      dest_lng: userLng
    });

    // Mark animal as BOOKED
    await db.update('animals', animal.id, { status: 'BOOKED' });

    // Record Audit Log
    await db.create('order_audit_logs', {
      order_id: newOrder.id,
      actor_id: req.user.id,
      actor_role: req.user.role,
      from_status: 'NONE',
      to_status: 'AWAITING_PAYMENT',
      notes: `Pesanan dibuat dengan invoice ${invoice_number}. Total: Rp ${grand_total.toLocaleString('id-ID')}`,
      ip_address: req.ip || '127.0.0.1'
    });

    // Notify seller
    notificationService.send(store.user_id, {
      title: '🔔 Pesanan Baru Masuk!',
      message: `Pesanan ${animal.title} masuk dari pembeli ${req.user.name}. Menunggu pembayaran.`,
      type: 'ORDER_CREATED',
      reference_id: newOrder.id
    });

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat! Silakan selesaikan pembayaran.',
      data: newOrder
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Gagal membuat pesanan.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders = await db.findMany('orders', {});

    if (req.user.role === 'BUYER') {
      orders = orders.filter(o => o.buyer_id === req.user.id);
    } else if (req.user.role === 'SELLER') {
      const stores = await db.findMany('stores', { user_id: req.user.id });
      const storeIds = stores.map(s => s.id);
      orders = orders.filter(o => storeIds.includes(o.store_id));
    } else if (req.user.role === 'COURIER') {
      orders = orders.filter(o => o.courier_id === req.user.id || (o.status === 'HEALTH_INSPECTION' && !o.courier_id));
    }

    // Enrich with animal & store details
    const populated = [];
    for (const o of orders) {
      const animal = await db.findById('animals', o.animal_id);
      const store = await db.findById('stores', o.store_id);
      const buyer = await db.findById('users', o.buyer_id);
      const courier = o.courier_id ? await db.findById('users', o.courier_id) : null;

      populated.push({
        ...o,
        animal: animal ? { id: animal.id, title: animal.title, images: animal.images, weight_kg: animal.weight_kg, category: animal.category } : null,
        store: store ? { id: store.id, store_name: store.store_name, farm_address: store.farm_address } : null,
        buyer: buyer ? { id: buyer.id, name: buyer.name, phone_number: buyer.phone_number } : null,
        courier: courier ? { id: courier.id, name: courier.name, phone_number: courier.phone_number } : null
      });
    }

    populated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar pesanan.' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await db.findById('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    const animal = await db.findById('animals', order.animal_id);
    const store = await db.findById('stores', order.store_id);

    // Strict Authorization: only buyer, seller owner, courier, or admin can access
    const isBuyer = order.buyer_id === req.user.id;
    const isSeller = store && store.user_id === req.user.id;
    const isCourier = order.courier_id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isCourier && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat data pesanan ini.'
      });
    }

    const buyer = await db.findById('users', order.buyer_id);
    const courier = order.courier_id ? await db.findById('users', order.courier_id) : null;
    const trackingLogs = await db.findMany('order_tracking_logs', { order_id: order.id });
    const auditLogs = await db.findMany('order_audit_logs', { order_id: order.id });
    const reviews = await db.findMany('reviews', { order_id: order.id });

    trackingLogs.sort((a, b) => new Date(b.recorded_at || b.created_at || 0) - new Date(a.recorded_at || a.created_at || 0));
    auditLogs.sort((a, b) => new Date(b.recorded_at || b.created_at || 0) - new Date(a.recorded_at || a.created_at || 0));

    return res.json({
      success: true,
      data: {
        ...order,
        animal,
        store,
        buyer: buyer ? { id: buyer.id, name: buyer.name, phone_number: buyer.phone_number, avatar_url: buyer.avatar_url } : null,
        courier: courier ? { id: courier.id, name: courier.name, phone_number: courier.phone_number } : null,
        trackingLogs,
        auditLogs,
        review: reviews.length > 0 ? reviews[0] : null
      }
    });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat rincian pesanan.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, courier_id } = req.body;

    const order = await db.findById('orders', id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    const fromStatus = order.status;
    const updateData = { status };

    if (courier_id) {
      updateData.courier_id = courier_id;
    }

    // Update animal status synchronization
    if (status === 'IN_TRANSIT') {
      await db.update('animals', order.animal_id, { status: 'IN_TRANSIT' });
    } else if (status === 'DELIVERED' || status === 'COMPLETED') {
      await db.update('animals', order.animal_id, { status: 'DELIVERED' });
    } else if (status === 'CANCELLED') {
      await db.update('animals', order.animal_id, { status: 'AVAILABLE' });
    }

    const updated = await db.update('orders', id, updateData);

    // Record Audit Log
    await db.create('order_audit_logs', {
      order_id: id,
      actor_id: req.user.id,
      actor_role: req.user.role,
      from_status: fromStatus,
      to_status: status,
      notes: notes || `Status diubah dari ${fromStatus} ke ${status}`,
      ip_address: req.ip || '127.0.0.1',
      recorded_at: new Date().toISOString()
    });

    // Notify Buyer
    notificationService.send(order.buyer_id, {
      title: '📦 Pembaruan Status Pesanan Ternak',
      message: `Status pesanan #${order.invoice_number} saat ini adalah: ${status}. Catatan: ${notes || '-'}`,
      type: 'STATUS_UPDATED',
      reference_id: id
    });

    return res.json({
      success: true,
      message: `Status pesanan berhasil diperbarui ke '${status}'.`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status pesanan.' });
  }
};

exports.updateOrderDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_discount, store_discount, voucher_code, notes } = req.body;

    const order = await db.findById('orders', id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    const admDisc = admin_discount !== undefined ? parseFloat(admin_discount) : parseFloat(order.admin_discount || 0);
    const strDisc = store_discount !== undefined ? parseFloat(store_discount) : parseFloat(order.store_discount || 0);
    const code = voucher_code !== undefined ? voucher_code : (order.voucher_code || '');

    // Recalculate grand total
    const basePrice = parseFloat(order.base_price || 0);
    const shippingFee = parseFloat(order.shipping_fee || 0);
    const shippingSubsidy = parseFloat(order.shipping_subsidy || 0);
    const serviceFee = parseFloat(order.service_fee || 0);

    const newGrandTotal = Math.max(0, (basePrice - strDisc - admDisc) + (shippingFee - shippingSubsidy) + serviceFee);

    const updated = await db.update('orders', id, {
      admin_discount: admDisc,
      store_discount: strDisc,
      voucher_code: code,
      grand_total: newGrandTotal
    });

    // Record Audit Log
    await db.create('order_audit_logs', {
      order_id: id,
      actor_id: req.user.id,
      actor_role: req.user.role,
      from_status: order.status,
      to_status: order.status,
      notes: notes || `Pemberian promo khusus pesanan: Diskon Admin Rp ${admDisc.toLocaleString('id-ID')}, Diskon Toko Rp ${strDisc.toLocaleString('id-ID')}, Kupon: ${code || '-'}`,
      ip_address: req.ip || '127.0.0.1',
      recorded_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Promo khusus untuk pesanan #${order.invoice_number} berhasil diperbarui!`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui promo pesanan.' });
  }
};

