// voucherController.js - Voucher Codes & Shipping Subsidies
const db = require('../database/adapter');

exports.getVouchers = async (req, res) => {
  try {
    const now = new Date().toISOString();
    let vouchers = await db.findMany('vouchers', {});

    // For public buyers, only show active and unexpired vouchers
    if (!req.user || req.user.role !== 'ADMIN') {
      vouchers = vouchers.filter(v => now >= v.start_time && now <= v.end_time && v.used_count < v.quota);
    }

    return res.json({ success: true, data: vouchers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat kupon diskon.' });
  }
};

exports.checkVoucher = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kode kupon wajib diisi.' });
    }

    const vouchers = await db.findMany('vouchers', { voucher_code: code.trim().toUpperCase() });
    if (vouchers.length === 0) {
      return res.status(404).json({ success: false, message: 'Kode kupon tidak valid atau tidak ditemukan.' });
    }

    const vch = vouchers[0];
    const now = new Date().toISOString();

    if (now < vch.start_time || now > vch.end_time) {
      return res.status(400).json({ success: false, message: 'Kupon telah kedaluwarsa atau belum dimulai.' });
    }

    if (vch.used_count >= vch.quota) {
      return res.status(400).json({ success: false, message: 'Kuota penggunaan kupon telah habis.' });
    }

    const purchaseAmount = parseFloat(amount || 0);
    if (purchaseAmount < parseFloat(vch.min_purchase)) {
      return res.status(400).json({
        success: false,
        message: `Minimal transaksi untuk kupon ini adalah Rp ${parseFloat(vch.min_purchase).toLocaleString('id-ID')}.`
      });
    }

    let discountNominal = 0;
    if (vch.discount_type === 'PERCENT') {
      const calculated = (purchaseAmount * parseFloat(vch.discount_value)) / 100;
      discountNominal = vch.max_discount_cap ? Math.min(calculated, vch.max_discount_cap) : calculated;
    } else {
      discountNominal = parseFloat(vch.discount_value);
    }

    return res.json({
      success: true,
      message: 'Kupon berhasil diterapkan!',
      data: {
        ...vch,
        calculated_discount: discountNominal
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memvalidasi kupon.' });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const {
      voucher_code,
      discount_type,
      discount_value,
      min_purchase,
      max_discount_cap,
      is_shipping_subsidy,
      start_time,
      end_time,
      quota
    } = req.body;

    if (!voucher_code || !discount_type || !discount_value) {
      return res.status(400).json({ success: false, message: 'Mohon lengkapi kode kupon, tipe diskon, dan nilai diskon.' });
    }

    const existing = await db.findMany('vouchers', { voucher_code: voucher_code.trim().toUpperCase() });
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Kode kupon tersebut sudah digunakan.' });
    }

    const newVoucher = await db.create('vouchers', {
      creator_id: req.user.id,
      store_id: req.body.store_id || null,
      voucher_code: voucher_code.trim().toUpperCase(),
      discount_type,
      discount_value: parseFloat(discount_value),
      min_purchase: min_purchase ? parseFloat(min_purchase) : 0,
      max_discount_cap: max_discount_cap ? parseFloat(max_discount_cap) : null,
      is_shipping_subsidy: Boolean(is_shipping_subsidy),
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      quota: parseInt(quota || 100, 10),
      used_count: 0
    });

    return res.status(201).json({
      success: true,
      message: 'Kupon diskon berhasil diterbitkan!',
      data: newVoucher
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal membuat kupon.' });
  }
};
