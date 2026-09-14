// badgeController.js - System Badges & Tiers CRUD for Users & Sellers
const db = require('../database/adapter');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Public / Authenticated: Get all badges list
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await db.findMany('badges', {});
    badges.sort((a, b) => parseInt(a.min_successful_orders || 0) - parseInt(b.min_successful_orders || 0));
    return res.json({ success: true, data: badges });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat data badges: ' + err.message });
  }
};

// Admin: Create Badge
exports.createBadge = async (req, res) => {
  try {
    const { name, icon_name, badge_color, min_successful_orders, min_turnover_idr } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama badge wajib diisi.' });
    }

    const slug = slugify(name);
    const existing = await db.findMany('badges', { slug });
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug atau nama badge sudah digunakan.' });
    }

    const newBadge = await db.create('badges', {
      name,
      slug,
      icon_name: icon_name || 'Award',
      badge_color: badge_color || '#64748b',
      min_successful_orders: parseInt(min_successful_orders || 0, 10),
      min_turnover_idr: parseFloat(min_turnover_idr || 0)
    });

    return res.status(201).json({ success: true, message: 'Badge berhasil dibuat.', data: newBadge });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal membuat badge: ' + err.message });
  }
};

// Admin: Update Badge
exports.updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById('badges', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Badge tidak ditemukan.' });
    }

    const { name, icon_name, badge_color, min_successful_orders, min_turnover_idr } = req.body;
    const payload = {};
    if (name) {
      payload.name = name;
      payload.slug = slugify(name);
    }
    if (icon_name) payload.icon_name = icon_name;
    if (badge_color) payload.badge_color = badge_color;
    if (min_successful_orders !== undefined) payload.min_successful_orders = parseInt(min_successful_orders, 10);
    if (min_turnover_idr !== undefined) payload.min_turnover_idr = parseFloat(min_turnover_idr);

    const updated = await db.update('badges', id, payload);
    return res.json({ success: true, message: 'Badge berhasil diperbarui.', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui badge: ' + err.message });
  }
};

// Admin: Delete Badge
exports.deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById('badges', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Badge tidak ditemukan.' });
    }

    // Unset badge_id on users pointing to this badge
    const usersWithBadge = await db.findMany('users', { badge_id: id });
    for (const u of usersWithBadge) {
      await db.update('users', u.id, { badge_id: null });
    }

    await db.delete('badges', id);
    return res.json({ success: true, message: 'Badge berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus badge: ' + err.message });
  }
};

// Admin: Manually assign badge to user
exports.assignUserBadge = async (req, res) => {
  try {
    const targetUserId = req.body.userId || req.body.user_id;
    const targetBadgeId = req.body.badgeId || req.body.badge_id;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'User ID wajib diisi.' });
    }

    const user = await db.findById('users', targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    if (targetBadgeId) {
      const badge = await db.findById('badges', targetBadgeId);
      if (!badge) {
        return res.status(404).json({ success: false, message: 'Badge target tidak ditemukan.' });
      }
    }

    const updatedUser = await db.update('users', targetUserId, { badge_id: targetBadgeId || null });
    return res.json({ success: true, message: 'Badge pengguna berhasil diperbarui.', data: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menugaskan badge: ' + err.message });
  }
};
