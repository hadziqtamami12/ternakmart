// animalController.js - Livestock Catalog, SKKH Certification & Qurban Engine
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

exports.getAnimals = async (req, res) => {
  try {
    const {
      category,
      breed,
      min_weight,
      max_weight,
      min_price,
      max_price,
      is_qurban_eligible,
      skkh_verified,
      teeth_poel,
      store_id,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let animals = await db.findMany('animals', {});

    // Filter by category
    if (category) {
      animals = animals.filter(a => a.category.toUpperCase() === category.toUpperCase());
    }

    // Filter by breed
    if (breed) {
      animals = animals.filter(a => a.breed.toLowerCase().includes(breed.toLowerCase()));
    }

    // Filter by status (default AVAILABLE unless seller looking at own animals)
    if (req.query.status) {
      animals = animals.filter(a => a.status === req.query.status);
    } else if (!store_id) {
      animals = animals.filter(a => a.status === 'AVAILABLE');
    }

    // Filter by store
    if (store_id) {
      animals = animals.filter(a => a.store_id === store_id);
    }

    // Filter by weight
    if (min_weight) {
      animals = animals.filter(a => parseFloat(a.weight_kg) >= parseFloat(min_weight));
    }
    if (max_weight) {
      animals = animals.filter(a => parseFloat(a.weight_kg) <= parseFloat(max_weight));
    }

    // Filter by price
    if (min_price) {
      animals = animals.filter(a => parseFloat(a.price) >= parseFloat(min_price));
    }
    if (max_price) {
      animals = animals.filter(a => parseFloat(a.price) <= parseFloat(max_price));
    }

    // Filter by Qurban eligibility
    if (is_qurban_eligible !== undefined && is_qurban_eligible !== '') {
      const isQurban = is_qurban_eligible === 'true' || is_qurban_eligible === true;
      animals = animals.filter(a => Boolean(a.is_qurban_eligible) === isQurban);
    }

    // Filter by SKKH verified
    if (skkh_verified !== undefined && skkh_verified !== '') {
      const isSkkh = skkh_verified === 'true' || skkh_verified === true;
      animals = animals.filter(a => Boolean(a.skkh_verification_status) === isSkkh);
    }

    // Filter by teeth poel
    if (teeth_poel) {
      animals = animals.filter(a => a.teeth_poel === teeth_poel);
    }

    // Free text search
    if (search) {
      const q = search.toLowerCase();
      animals = animals.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.breed.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      animals.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === 'price_desc') {
      animals.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sort === 'weight_desc') {
      animals.sort((a, b) => parseFloat(b.weight_kg) - parseFloat(a.weight_kg));
    } else if (sort === 'weight_asc') {
      animals.sort((a, b) => parseFloat(a.weight_kg) - parseFloat(b.weight_kg));
    } else {
      // Default newest
      animals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Total count before pagination
    const total = animals.length;

    // Attach store info
    const allStores = await db.findMany('stores', {});
    const storeMap = {};
    allStores.forEach(s => {
      storeMap[s.id] = {
        store_name: s.store_name,
        store_slug: s.store_slug,
        tier: s.tier,
        rating_average: s.rating_average,
        farm_address: s.farm_address,
        latitude: s.latitude,
        longitude: s.longitude
      };
    });

    // Pagination slice
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = animals.slice(startIndex, startIndex + limitNum).map(a => ({
      ...a,
      store: storeMap[a.store_id] || null
    }));

    return res.json({
      success: true,
      data: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('getAnimals error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat katalog hewan ternak.' });
  }
};

exports.getAnimalBySlug = async (req, res) => {
  try {
    const list = await db.findMany('animals', { slug: req.params.slug });
    if (list.length === 0) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    const animal = list[0];
    const store = await db.findById('stores', animal.store_id);
    const reviews = await db.findMany('reviews', { animal_id: animal.id });

    return res.json({
      success: true,
      data: {
        ...animal,
        store,
        reviews
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail hewan ternak.' });
  }
};

exports.getAnimalById = async (req, res) => {
  try {
    const animal = await db.findById('animals', req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    const store = await db.findById('stores', animal.store_id);
    return res.json({
      success: true,
      data: {
        ...animal,
        store
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data hewan.' });
  }
};

exports.createAnimal = async (req, res) => {
  try {
    const {
      title,
      category,
      breed,
      weight_kg,
      age_months,
      gender,
      teeth_poel,
      vaccination_status,
      skkh_certificate_url,
      price,
      is_qurban_eligible,
      images,
      video_url
    } = req.body;

    if (!title || !category || !breed || !weight_kg || !price) {
      return res.status(400).json({
        success: false,
        message: 'Harap lengkapi judul, kategori, ras/breed, bobot kg, dan harga ternak.'
      });
    }

    // Get seller's store
    let storeId = req.body.store_id;
    if (!storeId) {
      const userStores = await db.findMany('stores', { user_id: req.user.id });
      if (userStores.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Anda harus mendaftarkan toko kandang terlebih dahulu sebelum menjual ternak.'
        });
      }
      storeId = userStores[0].id;
    }

    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while ((await db.findMany('animals', { slug: finalSlug })).length > 0) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const newAnimal = await db.create('animals', {
      store_id: storeId,
      title,
      slug: finalSlug,
      category: category.toUpperCase(),
      breed,
      weight_kg: parseFloat(weight_kg),
      age_months: parseInt(age_months || 24, 10),
      gender: gender || 'JANTAN',
      teeth_poel: teeth_poel || 'POEL_1',
      vaccination_status: vaccination_status || 'Sudah vaksin PMK',
      skkh_certificate_url: skkh_certificate_url || '',
      skkh_verification_status: false, // Must be approved by admin
      price: parseFloat(price),
      is_qurban_eligible: is_qurban_eligible !== undefined ? Boolean(is_qurban_eligible) : true,
      status: 'AVAILABLE',
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'
      ],
      video_url: video_url || ''
    });

    // Notify admin for SKKH verification
    if (skkh_certificate_url) {
      notificationService.send('usr_admin_001', {
        title: '📜 Sertifikat SKKH Baru Menunggu Verifikasi',
        message: `Ternak '${title}' dari kandang mengunggah berkas SKKH untuk dicek keabsahannya.`,
        type: 'SKKH_VERIFICATION',
        reference_id: newAnimal.id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Hewan ternak berhasil ditambahkan ke katalog!',
      data: newAnimal
    });
  } catch (err) {
    console.error('createAnimal error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan hewan ternak.' });
  }
};

exports.updateAnimal = async (req, res) => {
  try {
    const animal = await db.findById('animals', req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    // Check store ownership if seller
    if (req.user.role === 'SELLER') {
      const store = await db.findById('stores', animal.store_id);
      if (!store || store.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak akses mengedit ternak ini.' });
      }
    }

    const updated = await db.update('animals', req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Data hewan ternak berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data ternak.' });
  }
};

exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await db.findById('animals', req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan tidak ditemukan.' });
    }

    if (req.user.role === 'SELLER') {
      const store = await db.findById('stores', animal.store_id);
      if (!store || store.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus ternak ini.' });
      }
    }

    await db.delete('animals', req.params.id);
    return res.json({ success: true, message: 'Hewan ternak berhasil dihapus dari katalog.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus data ternak.' });
  }
};

exports.verifySKKH = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, notes } = req.body;

    const animal = await db.findById('animals', id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    const updated = await db.update('animals', id, {
      skkh_verification_status: Boolean(is_verified)
    });

    const store = await db.findById('stores', animal.store_id);
    if (store) {
      notificationService.send(store.user_id, {
        title: is_verified ? '✅ SKKH Terverifikasi Resmi' : '⚠️ Verifikasi SKKH Ditolak',
        message: is_verified
          ? `Sertifikat SKKH untuk '${animal.title}' telah diverifikasi sah oleh Admin Ternakmart.`
          : `Verifikasi SKKH untuk '${animal.title}' belum disetujui. Catatan: ${notes || '-'}`,
        type: 'SKKH_VERIFIED',
        reference_id: id
      });
    }

    return res.json({
      success: true,
      message: `Status verifikasi SKKH berhasil diperbarui menjadi ${is_verified ? 'Sah / Terverifikasi' : 'Belum Diverifikasi'}.`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi SKKH.' });
  }
};
