// RegisterStorePage.jsx - Dedicated Store / Farm Onboarding & Approval Status Page
import React, { useState, useEffect } from 'react';
import {
  Store,
  ArrowLeft,
  Building2,
  MapPin,
  Upload,
  AlertCircle,
  LogIn,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';
import LeafletMapPicker from '../components/common/LeafletMapPicker';

export default function RegisterStorePage({ onBack, onSuccess, onNavigate }) {
  const { setDocumentTitle } = useAppConfig();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [latitude, setLatitude] = useState(-6.6895);
  const [longitude, setLongitude] = useState(106.7869);
  const [farmPhotoUrl, setFarmPhotoUrl] = useState('');
  const [nibSkuNumber, setNibSkuNumber] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    setDocumentTitle('Daftar & Buka Toko Kandang');
    if (isAuthenticated) {
      loadUserAddresses();
    }
  }, [isAuthenticated]);

  const loadUserAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.success && res.data && res.data.length > 0) {
        setSavedAddresses(res.data);
        const def = res.data.find(a => a.is_default) || res.data[0];
        if (def) {
          setSelectedAddressId(def.id);
          setFarmAddress(def.full_address);
          setLatitude(parseFloat(def.latitude) || -6.6895);
          setLongitude(parseFloat(def.longitude) || 106.7869);
        }
      }
    } catch (err) {
      console.warn('Could not load user addresses:', err);
    }
  };

  const handleSelectAddressPreset = (addrId) => {
    setSelectedAddressId(addrId);
    const addr = savedAddresses.find(a => a.id === addrId);
    if (addr) {
      setFarmAddress(addr.full_address);
      setLatitude(parseFloat(addr.latitude) || -6.6895);
      setLongitude(parseFloat(addr.longitude) || 106.7869);
    }
  };

  const handleCoordinateChange = (lat, lng, addressSnippet) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addressSnippet && !farmAddress) {
      setFarmAddress(addressSnippet);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto fasilitas kandang melebihi limit 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setFarmPhotoUrl(res.data.url);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengunggah foto kandang.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Harap masukkan nama toko atau kandang peternakan.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/stores/register', {
        store_name: storeName.trim(),
        description: description.trim(),
        farm_address: farmAddress.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        pickup_address_id: selectedAddressId || null,
        farm_photo_url: farmPhotoUrl,
        nib_sku_number: nibSkuNumber.trim(),
        bank_name: bankName,
        bank_account_number: bankAccountNumber.trim(),
        bank_account_holder: bankAccountHolder.trim() || user?.name
      });

      if (res.success) {
        setRegisteredSuccess(true);
        if (refreshUser) await refreshUser();
      } else {
        setError(res.message || 'Gagal mendaftarkan toko kandang.');
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan toko kandang.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. GUEST NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-theme-text">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-xs text-theme-muted">
          Pendaftaran toko/kandang peternakan hanya dapat diajukan oleh pengguna yang telah terdaftar dan login di TernakMart.
        </p>
        <button
          onClick={() => (onNavigate ? onNavigate('auth') : onBack ? onBack() : null)}
          className="px-5 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 mx-auto"
        >
          <LogIn className="w-4 h-4" /> Masuk Akun
        </button>
      </div>
    );
  }

  // 2. USER ALREADY HAS A STORE
  const hasStore = Boolean(user?.store || user?.has_store);
  const isVerified = user?.store?.is_verified;

  if (hasStore && !registeredSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6 pb-28">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
          {isVerified ? (
            /* STORE IS ALREADY APPROVED & ACTIVE */
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-wider mb-2">
                  Toko Aktif & Terverifikasi
                </span>
                <h1 className="text-2xl font-black text-theme-text">
                  {user.store?.store_name || 'Kandang Peternakan Anda'}
                </h1>
                <p className="text-xs text-theme-muted max-w-md mx-auto mt-2">
                  Toko kandang Anda telah diverifikasi oleh tim kurasi TernakMart. Anda dapat mulai memasang iklan hewan ternak, memproses pesanan, dan mengatur penjemputan armada GoTernak.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>Buka Dashboard Toko</span>
                </button>

                <button
                  onClick={() => onNavigate('manage-livestock')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-theme-border hover:bg-theme-bg text-theme-text text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Kelola Hewan Ternak</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STORE PENDING ADMIN VERIFICATION */
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                  ⏳ Menunggu Verifikasi Tim Admin
                </span>
                <h1 className="text-2xl font-black text-theme-text">
                  Pendaftaran Toko Sedang Ditinjau
                </h1>
                <p className="text-xs text-theme-muted max-w-md mx-auto mt-2 leading-relaxed">
                  Terima kasih telah mendaftar sebagai mitra peternak. Tim kurasi TernakMart sedang meninjau data identitas, fasilitas kandang, dan titik koordinat penjemputan armada Anda.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border text-left space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Nama Toko:</span>
                  <span className="font-bold text-theme-text">{user.store?.store_name || 'Kandang Mitra'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Status:</span>
                  <span className="font-bold text-amber-600">Pending Approval</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Estimasi Verifikasi:</span>
                  <span className="font-bold text-theme-text">Maksimal 1x24 Jam</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('home')}
                  className="px-6 py-2.5 rounded-2xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-sm"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. SUCCESS MESSAGE JUST SUBMITTED
  if (registeredSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5 pb-28">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-theme-text">Pendaftaran Toko Berhasil Diajukan!</h2>
          <p className="text-xs text-theme-muted max-w-md mx-auto leading-relaxed">
            Data kandang peternakan Anda telah masuk ke antrean verifikasi Admin. Menu toko dan dashboard penjual akan otomatis aktif segera setelah verifikasi disetujui.
          </p>
        </div>
        <button
          onClick={() => (onNavigate ? onNavigate('home') : onBack())}
          className="px-6 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-2xl shadow-sm hover:opacity-90"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // 4. ONBOARDING REGISTRATION FORM
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-32">
      <button
        onClick={onBack || (() => onNavigate('home'))}
        className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-theme-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-theme-primary/10 text-theme-primary">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-theme-text">
                Pendaftaran Toko Kandang Peternakan
              </h1>
              <p className="text-xs text-theme-muted mt-0.5">
                Daftarkan peternakan Anda untuk menjangkau ribuan pembeli ternak kurban, aqiqah, dan bibit di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Toko Name */}
          <div>
            <label className="font-bold text-theme-text block mb-1">
              Nama Toko / Peternakan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Barokah Cattle & Goat Farm"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-theme-text block mb-1">Deskripsi Singkat Peternakan</label>
            <textarea
              rows={3}
              placeholder="Spesialisasi bibit sapi PO, limosin, dan kambing perah berkualitas dengan sertifikat dinas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30 leading-relaxed"
            />
          </div>

          {/* Pick from Saved Addresses or Enter Manually */}
          {savedAddresses.length > 0 && (
            <div>
              <label className="font-bold text-theme-text block mb-1.5">
                Pilih Dari Alamat Tersimpan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectAddressPreset(addr.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-theme-primary bg-theme-primary-light/20 ring-1 ring-theme-primary'
                        : 'border-theme-border bg-theme-bg hover:border-theme-border/80'
                    }`}
                  >
                    <div className="font-bold text-theme-text flex items-center justify-between">
                      <span>{addr.label || 'Alamat'}</span>
                      {selectedAddressId === addr.id && (
                        <CheckCircle2 className="w-4 h-4 text-theme-primary" />
                      )}
                    </div>
                    <p className="text-theme-muted text-[11px] truncate mt-0.5">{addr.full_address}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Farm Address */}
          <div>
            <label className="font-bold text-theme-text block mb-1">
              Alamat Lengkap Kandang Penjemputan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jl. Raya Tajur No. 45, Desa Sukamaju, RT 02/RW 03..."
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
          </div>

          {/* Map Coordinates Pinpoint */}
          <div>
            <label className="font-bold text-theme-text block mb-1.5 flex items-center justify-between">
              <span>Titik Koordinat Kandang (Tikor GPS untuk Kurir GoTernak)</span>
              <span className="font-mono text-[10px] text-theme-muted">
                {Number(latitude || -6.2).toFixed(5)}, {Number(longitude || 106.8).toFixed(5)}
              </span>
            </label>

            <LeafletMapPicker
              initialLat={latitude}
              initialLng={longitude}
              onCoordinateSelect={handleCoordinateChange}
              height="260px"
            />
          </div>

          {/* Legal / SKU Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-theme-text block mb-1">Nomor NIB / SKU (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: 9120001234567"
                value={nibSkuNumber}
                onChange={(e) => setNibSkuNumber(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <p className="text-[10px] text-theme-muted mt-1">
                Mempercepat verifikasi & meningkatkan lencana toko ke Official Partner.
              </p>
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Foto Fasilitas Kandang</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer border-2 border-dashed border-theme-border hover:border-theme-primary/60 rounded-xl p-2.5 text-center transition-colors">
                  <span className="text-[11px] font-bold text-theme-primary flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Mengunggah...' : farmPhotoUrl ? 'Ganti Foto' : 'Unggah Foto Kandang'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {farmPhotoUrl && (
                  <img
                    src={farmPhotoUrl}
                    alt="Preview Kandang"
                    className="w-12 h-12 rounded-xl object-cover border border-theme-border"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bank Account Info */}
          <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
            <h3 className="font-extrabold text-theme-text text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-theme-primary" />
              <span>Rekening Bank Pencairan Hasil Penjualan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI (Syariah)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Nomor rekening"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Store className="w-4 h-4" />
              <span>{submitting ? 'Mengirim Pengajuan...' : 'Ajukan Pendaftaran Toko Kandang'}</span>
            </button>
            <p className="text-center text-[10px] text-theme-muted mt-2">
              Pendaftaran akan ditinjau tim admin TernakMart dalam 1x24 jam sebelum toko aktif.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
