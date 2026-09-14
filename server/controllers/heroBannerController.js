// heroBannerController.js - Management for Marketplace Hero Section Banners
const db = require('../database/adapter');

const DEFAULT_BANNERS = [
  {
    id: 'hero_banner_001',
    badge: 'FESTIVAL AKBAR QURBAN 1447H',
    categoryBadge: '🐂 SAPI & DOMBA SUPER',
    tag: 'Kupon: QURBANBERKAH',
    title: 'Diskon Spesial Ternak Hingga Rp 1.500.000',
    subtitle: 'Free Titip Rawat & Pakan Konsentrat sampai H-3 Idul Adha. Bebas Ongkir Armada Khusus Jabodetabek & Bandung.',
    cta: 'Beli Ternak Qurban',
    category: 'SAPI',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&auto=format&fit=crop&q=85',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'hero_banner_002',
    badge: 'LOGISTIK ARMADA MANDIRI',
    categoryBadge: '🚚 ARMADA KHUSUS',
    tag: 'Live GPS Tracking',
    title: 'Truk Pengantar Ber-AC & Checkpoint Pakan',
    subtitle: 'Pantau posisi GPS truk secara langsung ala Gojek. Hewan dipastikan rileks, diberi pakan & air minum di rest stop perjalanan.',
    cta: 'Lacak & Beli Ternak',
    category: 'KAMBING',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&auto=format&fit=crop&q=85',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'hero_banner_003',
    badge: 'JAMINAN 100% RESMI',
    categoryBadge: '✅ SKKH VERIFIED',
    tag: 'Terverifikasi Dinas',
    title: 'Sertifikat SKKH & Bebas Penyakit PMK',
    subtitle: 'Seluruh hewan lolos uji laboratorium karantina dinas peternakan. Garansi timbangan bobot riil 100% akurat.',
    cta: 'Cek Hewan Ber-SKKH',
    category: 'DOMBA',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1920&auto=format&fit=crop&q=85',
    is_active: true,
    sort_order: 3
  }
];

exports.getBanners = async (req, res) => {
  try {
    let banners = await db.findMany('hero_banners', {});
    if (!banners || !Array.isArray(banners) || banners.length === 0) {
      try {
        for (const b of DEFAULT_BANNERS) {
          await db.create('hero_banners', b);
        }
        banners = await db.findMany('hero_banners', {});
      } catch (innerErr) {
        banners = DEFAULT_BANNERS;
      }
    }

    if (!Array.isArray(banners) || banners.length === 0) {
      banners = [...DEFAULT_BANNERS];
    }

    // Sort by sort_order
    banners.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return res.json({ success: true, data: banners });
  } catch (err) {
    console.error('Error fetching hero banners:', err);
    return res.json({ success: true, data: DEFAULT_BANNERS });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const {
      badge,
      categoryBadge,
      tag,
      title,
      subtitle,
      cta,
      category,
      image,
      is_active,
      sort_order
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Judul dan URL gambar wajib diisi.' });
    }

    const currentBanners = await db.findMany('hero_banners', {});
    const newBanner = {
      badge: badge || 'PROMO TERNAK PILIHAN',
      categoryBadge: categoryBadge || '🐂 HEWAN TERBAIK',
      tag: tag || 'TernakMart Pilihan',
      title,
      subtitle: subtitle || '',
      cta: cta || 'Lihat Sekarang',
      category: category || 'SAPI',
      image,
      is_active: is_active !== false,
      sort_order: parseInt(sort_order) || currentBanners.length + 1
    };

    const created = await db.create('hero_banners', newBanner);
    return res.status(201).json({ success: true, message: 'Banner hero berhasil ditambahkan.', data: created });
  } catch (err) {
    console.error('Error creating hero banner:', err);
    return res.status(500).json({ success: false, message: err.message || 'Gagal menambahkan banner.' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById('hero_banners', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner hero tidak ditemukan.' });
    }

    const updated = await db.update('hero_banners', id, req.body);
    return res.json({ success: true, message: 'Banner hero berhasil diperbarui.', data: updated });
  } catch (err) {
    console.error('Error updating hero banner:', err);
    return res.status(500).json({ success: false, message: err.message || 'Gagal memperbarui banner.' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findById('hero_banners', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner hero tidak ditemukan.' });
    }

    await db.delete('hero_banners', id);
    return res.json({ success: true, message: 'Banner hero berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting hero banner:', err);
    return res.status(500).json({ success: false, message: err.message || 'Gagal menghapus banner.' });
  }
};
