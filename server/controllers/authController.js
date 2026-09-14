// authController.js - Authentication & User Management
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/adapter');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-ternakmart-jwt-key-2026-production-ready';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, phone_number, address, latitude, longitude, role } = req.body;

    if (!name || !username || !email || !password || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi seluruh kolom wajib: Nama, Username, Email, Sandi, dan Nomor WhatsApp.'
      });
    }

    // Check existing email
    const existingEmail = await db.findMany('users', { email: email.toLowerCase() });
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.'
      });
    }

    // Check existing username
    const existingUsername = await db.findMany('users', { username: username.toLowerCase() });
    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan oleh akun lain.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = ['BUYER', 'SELLER', 'COURIER', 'ADMIN'].includes(role) ? role : 'BUYER';

    const newUser = await db.create('users', {
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash,
      phone_number,
      avatar_url: req.body.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`,
      address: address || '',
      latitude: latitude ? parseFloat(latitude) : -6.2088,
      longitude: longitude ? parseFloat(longitude) : 106.8456,
      role: assignedRole
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil!',
      data: {
        token,
        user: safeUser
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mendaftarkan akun.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Harap masukkan Email atau Username serta Kata Sandi.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query by email first or username safely
    const allUsers = await db.findMany('users', {});
    const user = allUsers.find(
      u => (u.email && typeof u.email === 'string' && u.email.trim().toLowerCase() === cleanIdentifier) ||
           (u.username && typeof u.username === 'string' && u.username.trim().toLowerCase() === cleanIdentifier)
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak ditemukan. Periksa kembali email atau username Anda.'
      });
    }

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Akun ini belum memiliki kata sandi aktif. Silakan hubungi administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan coba kembali.'
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const { password_hash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Selamat datang kembali, ${safeUser.name}!`,
      data: {
        token,
        user: safeUser
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kegagalan server saat proses autentikasi.'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const { password_hash: _, ...safeUser } = user;

    // Check if user has a store
    let store = null;
    const stores = await db.findMany('stores', { user_id: user.id });
    if (stores.length > 0) {
      store = stores[0];
    }

    // Attach badge object
    let badge = null;
    if (user.badge_id) {
      badge = await db.findById('badges', user.badge_id);
    }
    if (!badge) {
      // Default to Silver Member
      const defaultBadges = await db.findMany('badges', { slug: 'silver-member' });
      if (defaultBadges.length > 0) badge = defaultBadges[0];
    }

    const hasStore = Boolean(store || user.has_store);

    return res.json({
      success: true,
      data: {
        ...safeUser,
        has_store: hasStore,
        badge,
        store
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil profil akun.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone_number, address, latitude, longitude, avatar_url } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone_number) updateData.phone_number = phone_number;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (avatar_url) updateData.avatar_url = avatar_url;

    const updated = await db.update('users', req.user.id, updateData);
    const { password_hash: _, ...safeUser } = updated;

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: safeUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
};

// Admin User Management CRUD
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await db.findMany('users', {});

    let filtered = users.map(u => {
      const { password_hash, ...safe } = u;
      return safe;
    });

    if (role && role !== 'ALL') {
      filtered = filtered.filter(u => u.role === role);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone_number && u.phone_number.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      data: filtered
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar pengguna.' });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const { name, username, email, password, phone_number, address, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi nama, username, email, dan kata sandi.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Validate duplicate
    const allUsers = await db.findMany('users', {});
    if (allUsers.some(u => u.username?.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }
    if (allUsers.some(u => u.email?.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = ['BUYER', 'SELLER', 'COURIER', 'ADMIN'].includes(role) ? role : 'BUYER';

    const newUser = await db.create('users', {
      name,
      username: cleanUsername,
      email: cleanEmail,
      password_hash,
      phone_number: phone_number || '',
      address: address || '',
      avatar_url: req.body.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`,
      role: assignedRole
    });

    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: `Pengguna '${safeUser.name}' dengan peran ${safeUser.role} berhasil dibuat!`,
      data: safeUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal membuat pengguna baru.' });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone_number, address, role, password } = req.body;

    const existingUser = await db.findById('users', id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (address !== undefined) updateData.address = address;
    if (role && ['BUYER', 'SELLER', 'COURIER', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }
    if (password && password.trim().length >= 6) {
      updateData.password_hash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await db.update('users', id, updateData);
    const { password_hash: _, ...safeUser } = updated;

    return res.json({
      success: true,
      message: `Data pengguna '${safeUser.name}' berhasil diperbarui.`,
      data: safeUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data pengguna.' });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun admin yang sedang aktif login.'
      });
    }

    const existing = await db.findById('users', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    await db.delete('users', id);
    return res.json({
      success: true,
      message: `Akun '${existing.name}' berhasil dihapus dari sistem.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus pengguna.' });
  }
};

// Helper: Parse coordinates from URL or string
function parseCoordinatesFromText(text) {
  if (!text) return null;
  // Match @lat,lng
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };

  // Match !3dlat!4dlng (Google Maps protobuf in URL)
  const protoMatch = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (protoMatch) return { latitude: parseFloat(protoMatch[1]), longitude: parseFloat(protoMatch[2]) };

  // Match q=lat,lng or ll=lat,lng
  const qMatch = text.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { latitude: parseFloat(qMatch[1]), longitude: parseFloat(qMatch[2]) };

  // Match raw lat, lng pair (e.g. -6.2088, 106.8456)
  const rawMatch = text.match(/(-?\d+\.\d{3,})\s*,\s*(-?\d+\.\d{3,})/);
  if (rawMatch) return { latitude: parseFloat(rawMatch[1]), longitude: parseFloat(rawMatch[2]) };

  return null;
}

exports.resolveLocation = async (req, res) => {
  try {
    const { mapUrl, address, latitude: inputLat, longitude: inputLng } = req.body;

    // 1. If coordinates already provided, optionally reverse-geocode to get friendly address
    if (inputLat !== undefined && inputLng !== undefined) {
      const lat = parseFloat(inputLat);
      const lng = parseFloat(inputLng);
      let resolvedAddress = address || '';

      if (!resolvedAddress) {
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'TernakMart/1.0 (info@ternakmart.id)' }
          });
          const revData = await revRes.json();
          if (revData && revData.display_name) {
            resolvedAddress = revData.display_name;
          }
        } catch (e) {}
      }

      return res.json({
        success: true,
        data: {
          latitude: lat,
          longitude: lng,
          address: resolvedAddress,
          source: 'gps_or_coordinates'
        }
      });
    }

    // 2. If Google Maps / WA shareloc link is provided
    if (mapUrl && typeof mapUrl === 'string' && mapUrl.trim().length > 0) {
      const trimmedUrl = mapUrl.trim();
      let coords = parseCoordinatesFromText(trimmedUrl);

      // If coords not immediately in string and it's a URL, follow HTTP redirect
      if (!coords && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
        try {
          const response = await fetch(trimmedUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          const finalUrl = response.url;
          coords = parseCoordinatesFromText(finalUrl);

          // If still not found in URL, search within HTML body for coordinates
          if (!coords) {
            const html = await response.text();
            coords = parseCoordinatesFromText(html);
          }
        } catch (fetchErr) {
          console.warn('Redirect resolution error:', fetchErr.message);
        }
      }

      if (coords) {
        // Reverse-geocode to get friendly address name
        let resolvedAddress = address || '';
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`, {
            headers: { 'User-Agent': 'TernakMart/1.0 (info@ternakmart.id)' }
          });
          const revData = await revRes.json();
          if (revData && revData.display_name) {
            resolvedAddress = revData.display_name;
          }
        } catch (e) {}

        return res.json({
          success: true,
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            address: resolvedAddress || 'Lokasi dari Google Maps',
            source: 'google_maps_link'
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengekstrak titik koordinat dari tautan peta yang diberikan. Pastikan tautan valid.'
      });
    }

    // 3. If address text is provided, geocode using OpenStreetMap Nominatim with smart fallbacks
    if (address && typeof address === 'string' && address.trim().length > 0) {
      const candidates = [
        address.trim(),
        address.replace(/(?:no\.?\s*\d+|rt\.?\s*\d+|rw\.?\s*\d+|blok\s*[a-z0-9]+)/gi, '').replace(/\s{2,}/g, ' ').trim(),
        address.split(',').slice(-2).join(', ').trim()
      ].filter(Boolean);

      for (const query of candidates) {
        try {
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=1`;
          const nomRes = await fetch(nomUrl, {
            headers: { 'User-Agent': 'TernakMart/1.0 (info@ternakmart.id)' }
          });
          const data = await nomRes.json();

          if (data && data.length > 0) {
            return res.json({
              success: true,
              data: {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                address: data[0].display_name,
                source: 'address_geocoding'
              }
            });
          }
        } catch (geoErr) {
          console.warn('Geocoding attempt error:', geoErr.message);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Alamat tidak ditemukan pada peta. Coba tambahkan nama kota atau gunakan opsi GPS / Google Maps.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Mohon sertakan tautan Google Maps, koordinat GPS, atau alamat lengkap.'
    });
  } catch (err) {
    console.error('Resolve location error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses lokasi.'
    });
  }
};

