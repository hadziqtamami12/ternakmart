// reviewController.js - Livestock Rating & Real-Weight Verification Review
const db = require('../database/adapter');
const { computeStoreTier } = require('./storeController');

exports.createReview = async (req, res) => {
  try {
    const { order_id, rating, weight_match_rating, comment, media_urls } = req.body;

    if (!order_id || !rating || !weight_match_rating) {
      return res.status(400).json({
        success: false,
        message: 'Mohon sertakan ID pesanan, rating bintang (1-5), dan penilaian kesesuaian timbangan bobot (1-5).'
      });
    }

    const order = await db.findById('orders', order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Hanya pembeli pesanan ini yang dapat memberikan ulasan.' });
    }

    // Check if already reviewed
    const existing = await db.findMany('reviews', { order_id });
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Pesanan ini sudah pernah diulas.' });
    }

    const newReview = await db.create('reviews', {
      order_id,
      user_id: req.user.id,
      store_id: order.store_id,
      animal_id: order.animal_id,
      rating: parseInt(rating, 10),
      weight_match_rating: parseInt(weight_match_rating, 10),
      comment: comment || '',
      media_urls: Array.isArray(media_urls) ? media_urls : []
    });

    // Mark order COMPLETED if not already
    if (order.status !== 'COMPLETED') {
      await db.update('orders', order_id, { status: 'COMPLETED' });
      await db.create('order_audit_logs', {
        order_id,
        actor_id: req.user.id,
        actor_role: 'BUYER',
        from_status: order.status,
        to_status: 'COMPLETED',
        notes: `Pesanan selesai setelah pembeli memberikan ulasan rating ${rating}/5.`,
        ip_address: req.ip || '127.0.0.1'
      });
    }

    // Update store average rating
    const allStoreReviews = await db.findMany('reviews', { store_id: order.store_id });
    const avg = allStoreReviews.reduce((sum, r) => sum + r.rating, 0) / allStoreReviews.length;
    await db.update('stores', order.store_id, {
      rating_average: Math.round(avg * 100) / 100,
      total_reviews: allStoreReviews.length
    });

    // Recompute store tier dynamically
    await computeStoreTier(order.store_id);

    return res.status(201).json({
      success: true,
      message: 'Ulasan dan penilaian timbangan ternak berhasil disimpan!',
      data: newReview
    });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ success: false, message: 'Gagal membuat ulasan.' });
  }
};

exports.getStoreReviews = async (req, res) => {
  try {
    const { storeId } = req.params;
    let reviews = await db.findMany('reviews', { store_id: storeId });
    if (!Array.isArray(reviews)) reviews = [];

    // Populate reviewer names
    const populated = [];
    for (const r of reviews) {
      try {
        const user = await db.findById('users', r.user_id).catch(() => null);
        const animal = await db.findById('animals', r.animal_id).catch(() => null);
        let media = r.media_urls;
        if (typeof media === 'string') {
          try { media = JSON.parse(media); } catch (e) { media = []; }
        }
        populated.push({
          ...r,
          media_urls: Array.isArray(media) ? media : [],
          user_name: user ? user.name : 'Pembeli Ternak',
          user_avatar: user ? user.avatar_url : '',
          animal_title: animal ? animal.title : 'Hewan Ternak'
        });
      } catch (innerErr) {
        populated.push(r);
      }
    }

    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error('getStoreReviews error:', err);
    return res.json({ success: true, data: [] });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    let reviews = await db.findMany('reviews', {});
    if (!Array.isArray(reviews) || reviews.length === 0) {
      const initialSeeds = require('../database/seedData');
      reviews = initialSeeds.reviews || [];
    }

    const populated = [];
    for (const r of reviews) {
      try {
        const user = await db.findById('users', r.user_id).catch(() => null);
        const animal = await db.findById('animals', r.animal_id).catch(() => null);
        const store = await db.findById('stores', r.store_id).catch(() => null);
        let media = r.media_urls;
        if (typeof media === 'string') {
          try { media = JSON.parse(media); } catch (e) { media = []; }
        }
        populated.push({
          ...r,
          media_urls: Array.isArray(media) ? media : [],
          user_name: r.user_name_override || (user ? user.name : 'Pembeli Terverifikasi'),
          user_avatar: user ? user.avatar_url : '',
          animal_title: animal ? animal.title : 'Hewan Qurban Berkualitas',
          store_name: store ? store.store_name : 'Sentra Peternak Berkah'
        });
      } catch (innerErr) {
        populated.push(r);
      }
    }
    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error('getAllReviews error:', err);
    const initialSeeds = require('../database/seedData');
    return res.json({ success: true, data: initialSeeds.reviews || [] });
  }
};

exports.createAdminReview = async (req, res) => {
  try {
    const { user_name, rating, weight_match_rating, comment, animal_id, store_id } = req.body;
    const newRev = await db.create('reviews', {
      order_id: `ord_rev_${Date.now()}`,
      user_id: req.user.id,
      store_id: store_id || 'str_001',
      animal_id: animal_id || 'anm_001',
      rating: parseInt(rating, 10) || 5,
      weight_match_rating: parseInt(weight_match_rating, 10) || 5,
      comment: comment || 'Timbangan sangat akurat dan hewan sangat sehat.',
      user_name_override: user_name,
      media_urls: []
    });
    return res.status(201).json({ success: true, message: 'Ulasan berhasil ditambahkan!', data: newRev });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan ulasan.' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, weight_match_rating } = req.body;
    const updated = await db.update('reviews', id, {
      rating: parseInt(rating, 10),
      comment,
      weight_match_rating: parseInt(weight_match_rating, 10)
    });
    return res.json({ success: true, message: 'Ulasan berhasil diperbarui!', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui ulasan.' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete('reviews', id);
    return res.json({ success: true, message: 'Ulasan berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus ulasan.' });
  }
};
