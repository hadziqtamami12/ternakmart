// storeController.js - Multi-Vendor Farm Store Management
const db = require('../database/adapter');
const notificationService = require('../services/notification');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Automatic Tier Calculation Engine
async function computeStoreTier(storeId) {
  const store = await db.findById('stores', storeId);
  if (!store) return 'BRONZE';

  const completedOrders = await db.findMany('orders', { store_id: storeId, status: 'COMPLETED' });
  const volume = completedOrders.length;
  const rating = parseFloat(store.rating_average || 0);
  const hasNib = Boolean(store.nib_sku_number && store.nib_sku_number.trim().length > 5);

  let newTier = 'BRONZE';
  if (hasNib && volume >= 30 && rating >= 4.8) {
    newTier = 'OFFICIAL';
  } else if (volume >= 20 && rating >= 4.7) {
    newTier = 'PLATINUM';
  } else if (volume >= 10 && rating >= 4.5) {
    newTier = 'GOLD';
  } else if (volume >= 3 && rating >= 4.0) {
    newTier = 'SILVER';
  }

  if (newTier !== store.tier) {
    await db.update('stores', storeId, { tier: newTier });
  }
  return newTier;
}

exports.registerStore = async (req, res) => {
  try {
    const {
      store_name,
      description,
      farm_address,
      latitude,
      longitude,
      farm_photo_url,
      nib_sku_number,
      bank_name,
      bank_account_number,
      bank_account_holder
    } = req.body;

    if (!store_name || !farm_address || !bank_name || !bank_account_number) {
      return res.status(400).json({
        success: false,
        message: 'Harap lengkapi nama toko/kandang, alamat peternakan, dan rekening bank penampung.'
      });
    }

    // Check if seller already registered a store
    const existing = await db.findMany('stores', { user_id: req.user.id });
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Akun Anda telah memiliki kandang peternakan terdaftar.'
      });
    }

    let baseSlug = slugify(store_name);
    let finalSlug = baseSlug;
    let count = 1;
    while ((await db.findMany('stores', { store_slug: finalSlug })).length > 0) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const newStore = await db.create('stores', {
      user_id: req.user.id,
      store_name,
      store_slug: finalSlug,
      description: description || '',
      farm_address,
      latitude: latitude ? parseFloat(latitude) : -6.595,
      longitude: longitude ? parseFloat(longitude) : 106.816,
      farm_photo_url: farm_photo_url || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
      nib_sku_number: nib_sku_number || '',
      bank_name,
      bank_account_number,
      bank_account_holder: bank_account_holder || req.user.name,
      tier: 'BRONZE',
      status: 'PENDING', // Awaiting Admin Approval
      rating_average: 0.0,
      total_reviews: 0
    });

    // Update user role to SELLER if not yet
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      await db.update('users', req.user.id, { role: 'SELLER' });
    }

    // Notify admins
    notificationService.send('usr_admin_001', {
      title: '📋 Pendaftaran Toko Kandang Baru',
      message: `Toko kandang '${store_name}' mendaftar dan menunggu verifikasi legalitas NIB.`,
      type: 'STORE_REGISTRATION',
      reference_id: newStore.id
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran toko kandang berhasil diajukan! Menunggu verifikasi tim Admin Ternakmart.',
      data: newStore
    });
  } catch (err) {
    console.error('Register store error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengajukan pendaftaran toko.' });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { status, tier } = req.query;
    const query = {};
    if (status) query.status = status;
    if (tier) query.tier = tier;

    // Non-admin default to ACTIVE stores only
    if (!req.user || req.user.role !== 'ADMIN') {
      query.status = 'ACTIVE';
    }

    const stores = await db.findMany('stores', query);
    return res.json({ success: true, data: stores });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar toko peternak.' });
  }
};

exports.getStoreBySlug = async (req, res) => {
  try {
    const stores = await db.findMany('stores', { store_slug: req.params.slug });
    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Toko kandang tidak ditemukan.' });
    }

    const store = stores[0];
    const animals = await db.findMany('animals', { store_id: store.id, status: 'AVAILABLE' });
    const owner = await db.findById('users', store.user_id);

    return res.json({
      success: true,
      data: {
        ...store,
        animals,
        owner: owner ? { name: owner.name, phone_number: owner.phone_number, avatar_url: owner.avatar_url } : null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat profil toko.' });
  }
};

exports.updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status, notes } = req.body; // ACTIVE, REJECTED, SUSPENDED

    if (!['ACTIVE', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status toko tidak valid.' });
    }

    const store = await db.findById('stores', storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan.' });
    }

    const updated = await db.update('stores', storeId, { status });

    // Recalculate tier upon activation
    if (status === 'ACTIVE') {
      await computeStoreTier(storeId);
    }

    // Notify store owner
    notificationService.send(store.user_id, {
      title: status === 'ACTIVE' ? '🎉 Kandang Anda Disetujui!' : '⚠️ Update Status Kandang',
      message: status === 'ACTIVE'
        ? `Selamat! Toko kandang '${store.store_name}' telah diverifikasi aktif dan siap menjual hewan ternak.`
        : `Status toko kandang Anda diubah menjadi ${status}. Catatan: ${notes || '-'}`,
      type: 'STORE_STATUS_UPDATED',
      reference_id: storeId
    });

    return res.json({
      success: true,
      message: `Status toko berhasil diubah menjadi ${status}.`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status toko.' });
  }
};

module.exports.computeStoreTier = computeStoreTier;
