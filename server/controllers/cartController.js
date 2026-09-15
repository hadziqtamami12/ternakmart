// cartController.js - Multi-Store Livestock Cart
const db = require('../database/adapter');

exports.getCart = async (req, res) => {
  try {
    const carts = await db.findMany('carts', { user_id: req.user.id });
    let cart = carts.length > 0 ? carts[0] : null;

    if (!cart) {
      cart = await db.create('carts', {
        user_id: req.user.id,
        items_json: []
      });
    }

    const rawItems = cart.items_json || [];

    // Consolidate duplicate animal_id entries by summing their quantities
    const consolidatedMap = new Map();
    for (const it of rawItems) {
      if (!it?.animal_id) continue;
      const aId = String(it.animal_id);
      if (consolidatedMap.has(aId)) {
        const existing = consolidatedMap.get(aId);
        existing.quantity = (existing.quantity || 1) + (it.quantity || 1);
        if (it.notes && !existing.notes) existing.notes = it.notes;
      } else {
        consolidatedMap.set(aId, { ...it, quantity: it.quantity || 1 });
      }
    }
    const cleanItems = Array.from(consolidatedMap.values());

    if (cleanItems.length !== rawItems.length) {
      await db.update('carts', cart.id, { items_json: cleanItems });
    }

    // Populate animal and store details
    const populated = [];
    for (const item of cleanItems) {
      const animal = await db.findById('animals', item.animal_id);
      if (animal) {
        const store = await db.findById('stores', animal.store_id);
        populated.push({
          id: animal.id,
          animal_id: animal.id,
          slug: animal.slug,
          store_id: store ? store.id : animal.store_id,
          store_name: store ? store.store_name : 'Kandang Peternak',
          store_tier: store ? store.tier : 'BRONZE',
          farm_address: store ? store.farm_address : '',
          store: store || { id: animal.store_id, store_name: 'Kandang Peternak', farm_address: '' },
          title: animal.title,
          category: animal.category,
          breed: animal.breed,
          weight_kg: animal.weight_kg,
          age_months: animal.age_months,
          gender: animal.gender,
          teeth_poel: animal.teeth_poel || 'POEL_1',
          vaccination_status: animal.vaccination_status,
          skkh_verification_status: animal.skkh_verification_status,
          skkh_certificate_url: animal.skkh_certificate_url,
          price: animal.price,
          images: Array.isArray(animal.images) ? animal.images : [],
          image_url: (animal.images && animal.images[0]) || '',
          video_url: animal.video_url || '',
          description: animal.description || '',
          is_qurban_eligible: animal.is_qurban_eligible,
          quantity: item.quantity || 1,
          notes: item.notes || ''
        });
      }
    }

    return res.json({
      success: true,
      data: {
        id: cart.id,
        items: populated
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil keranjang belanja.' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { animal_id, notes, quantity = 1 } = req.body;
    const addQty = Math.max(1, parseInt(quantity) || 1);

    const animal = await db.findById('animals', animal_id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Hewan ternak tidak ditemukan.' });
    }

    if (animal.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Mohon maaf, hewan ternak ini sudah dipesan atau tidak lagi tersedia.'
      });
    }

    const carts = await db.findMany('carts', { user_id: req.user.id });
    let cart = carts.length > 0 ? carts[0] : null;

    if (!cart) {
      cart = await db.create('carts', {
        user_id: req.user.id,
        items_json: []
      });
    }

    let items = cart.items_json || [];
    const targetIdStr = String(animal_id);
    let found = false;
    const cleanItems = [];

    for (const it of items) {
      if (String(it.animal_id) === targetIdStr) {
        if (!found) {
          cleanItems.push({
            ...it,
            animal_id: animal.id,
            store_id: animal.store_id,
            quantity: (it.quantity || 1) + addQty,
            notes: notes || it.notes || ''
          });
          found = true;
        } else {
          // Merge any pre-existing duplicate's quantity
          cleanItems[cleanItems.length - 1].quantity += (it.quantity || 1);
        }
      } else {
        cleanItems.push(it);
      }
    }

    if (!found) {
      cleanItems.push({
        animal_id: animal.id,
        store_id: animal.store_id,
        quantity: addQty,
        notes: notes || '',
        added_at: new Date().toISOString()
      });
    }

    await db.update('carts', cart.id, { items_json: cleanItems });

    return res.json({
      success: true,
      message: 'Jumlah hewan ternak berhasil diperbarui di keranjang belanja.',
      data: { itemsCount: cleanItems.length }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan ternak ke keranjang.' });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { animal_id, quantity } = req.body;
    const newQty = parseInt(quantity);

    const carts = await db.findMany('carts', { user_id: req.user.id });
    if (carts.length === 0) {
      return res.status(404).json({ success: false, message: 'Keranjang tidak ditemukan.' });
    }

    const cart = carts[0];
    let items = cart.items_json || [];

    if (newQty <= 0) {
      items = items.filter(i => i.animal_id !== animal_id);
    } else {
      const idx = items.findIndex(i => i.animal_id === animal_id);
      if (idx > -1) {
        items[idx].quantity = newQty;
      }
    }

    await db.update('carts', cart.id, { items_json: items });
    return res.json({ success: true, message: 'Jumlah berhasil diperbarui.', data: { items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui jumlah item.' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { animal_ids } = req.body;
    if (!Array.isArray(animal_ids) || animal_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID hewan tidak valid.' });
    }

    const carts = await db.findMany('carts', { user_id: req.user.id });
    if (carts.length === 0) {
      return res.json({ success: true, message: 'Keranjang kosong.' });
    }

    const cart = carts[0];
    let items = (cart.items_json || []).filter(i => !animal_ids.includes(i.animal_id));
    await db.update('carts', cart.id, { items_json: items });

    return res.json({ success: true, message: `${animal_ids.length} item berhasil dihapus dari keranjang.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus item terpilih.' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { animal_id } = req.params;
    const carts = await db.findMany('carts', { user_id: req.user.id });
    if (carts.length === 0) {
      return res.json({ success: true, message: 'Keranjang sudah kosong.' });
    }

    const cart = carts[0];
    let items = (cart.items_json || []).filter(i => i.animal_id !== animal_id);
    await db.update('carts', cart.id, { items_json: items });

    return res.json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang.',
      data: { itemsCount: items.length }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus item dari keranjang.' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const carts = await db.findMany('carts', { user_id: req.user.id });
    if (carts.length > 0) {
      await db.update('carts', carts[0].id, { items_json: [] });
    }
    return res.json({ success: true, message: 'Keranjang berhasil dikosongkan.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengosongkan keranjang.' });
  }
};
