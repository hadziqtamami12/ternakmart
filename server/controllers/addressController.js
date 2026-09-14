// addressController.js - Multi-Address & Coordinate (Tikor) Management
const db = require('../database/adapter');

exports.getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await db.findMany('user_addresses', { user_id: userId });
    addresses.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
    return res.json({ success: true, data: addresses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar alamat: ' + err.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      label,
      recipient_name,
      phone_number,
      full_address,
      province,
      city,
      district,
      postal_code,
      latitude,
      longitude,
      is_default
    } = req.body;

    if (!recipient_name || !phone_number || !full_address) {
      return res.status(400).json({ success: false, message: 'Nama penerima, no. HP, dan alamat lengkap wajib diisi.' });
    }

    // If marked as default, unset previous defaults
    if (is_default) {
      const existingList = await db.findMany('user_addresses', { user_id: userId });
      for (const item of existingList) {
        if (item.is_default) {
          await db.update('user_addresses', item.id, { is_default: false });
        }
      }
    } else {
      // If this is the user's very first address, make it default automatically
      const existingList = await db.findMany('user_addresses', { user_id: userId });
      if (existingList.length === 0) {
        req.body.is_default = true;
      }
    }

    const lat = latitude !== undefined && latitude !== null ? parseFloat(latitude) : -6.2088;
    const lng = longitude !== undefined && longitude !== null ? parseFloat(longitude) : 106.8456;

    const newAddress = await db.create('user_addresses', {
      user_id: userId,
      label: label || 'Rumah',
      recipient_name,
      phone_number,
      full_address,
      province: province || '',
      city: city || '',
      district: district || '',
      postal_code: postal_code || '',
      latitude: lat,
      longitude: lng,
      is_default: Boolean(req.body.is_default)
    });

    // If default, also sync user primary coordinates
    if (newAddress.is_default) {
      await db.update('users', userId, {
        address: full_address,
        latitude: lat,
        longitude: lng
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Alamat dan titik koordinat berhasil disimpan.',
      data: newAddress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan alamat: ' + err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const existing = await db.findById('user_addresses', id);

    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan.' });
    }

    const {
      label,
      recipient_name,
      phone_number,
      full_address,
      province,
      city,
      district,
      postal_code,
      latitude,
      longitude,
      is_default
    } = req.body;

    if (is_default) {
      const existingList = await db.findMany('user_addresses', { user_id: userId });
      for (const item of existingList) {
        if (item.id !== id && item.is_default) {
          await db.update('user_addresses', item.id, { is_default: false });
        }
      }
    }

    const updatedPayload = {};
    if (label !== undefined) updatedPayload.label = label;
    if (recipient_name !== undefined) updatedPayload.recipient_name = recipient_name;
    if (phone_number !== undefined) updatedPayload.phone_number = phone_number;
    if (full_address !== undefined) updatedPayload.full_address = full_address;
    if (province !== undefined) updatedPayload.province = province;
    if (city !== undefined) updatedPayload.city = city;
    if (district !== undefined) updatedPayload.district = district;
    if (postal_code !== undefined) updatedPayload.postal_code = postal_code;
    if (latitude !== undefined) updatedPayload.latitude = parseFloat(latitude);
    if (longitude !== undefined) updatedPayload.longitude = parseFloat(longitude);
    if (is_default !== undefined) updatedPayload.is_default = Boolean(is_default);

    const updated = await db.update('user_addresses', id, updatedPayload);

    if (updated.is_default) {
      await db.update('users', userId, {
        address: updated.full_address,
        latitude: updated.latitude,
        longitude: updated.longitude
      });
    }

    return res.json({
      success: true,
      message: 'Alamat berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui alamat: ' + err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const target = await db.findById('user_addresses', id);

    if (!target || target.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan.' });
    }

    const existingList = await db.findMany('user_addresses', { user_id: userId });
    for (const item of existingList) {
      await db.update('user_addresses', item.id, { is_default: item.id === id });
    }

    // Sync to user
    await db.update('users', userId, {
      address: target.full_address,
      latitude: target.latitude,
      longitude: target.longitude
    });

    return res.json({ success: true, message: 'Alamat utama default berhasil diubah.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengubah alamat default: ' + err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const target = await db.findById('user_addresses', id);

    if (!target || target.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan.' });
    }

    await db.delete('user_addresses', id);

    // If deleted address was default, set another address as default
    if (target.is_default) {
      const remaining = await db.findMany('user_addresses', { user_id: userId });
      if (remaining.length > 0) {
        await db.update('user_addresses', remaining[0].id, { is_default: true });
        await db.update('users', userId, {
          address: remaining[0].full_address,
          latitude: remaining[0].latitude,
          longitude: remaining[0].longitude
        });
      }
    }

    return res.json({ success: true, message: 'Alamat berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus alamat: ' + err.message });
  }
};
