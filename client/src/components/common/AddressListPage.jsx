// AddressListPage.jsx - User Multi-Address Management with Inline Add/Edit Form & Map Coordinates
import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Home,
  Building2,
  Warehouse,
  ExternalLink,
  ArrowLeft,
  X,
  Save,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import LeafletMapPicker from './LeafletMapPicker';

export default function AddressListPage({ onBack, onNavigate }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const formCardRef = useRef(null);

  // Form State
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [province, setProvince] = useState('Jawa Barat');
  const [city, setCity] = useState('Bogor');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState(-6.2088);
  const [longitude, setLongitude] = useState(106.8456);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.warn('Fetch addresses error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setLabel('Rumah');
    setRecipientName('');
    setPhoneNumber('');
    setFullAddress('');
    setProvince('Jawa Barat');
    setCity('Bogor');
    setDistrict('');
    setPostalCode('');
    setLatitude(-6.2088);
    setLongitude(106.8456);
    setIsDefault(addresses.length === 0);
    setFormError('');
    setIsFormOpen(true);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setLabel(addr.label || 'Rumah');
    setRecipientName(addr.recipient_name || '');
    setPhoneNumber(addr.phone_number || '');
    setFullAddress(addr.full_address || '');
    setProvince(addr.province || 'Jawa Barat');
    setCity(addr.city || 'Bogor');
    setDistrict(addr.district || '');
    setPostalCode(addr.postal_code || '');
    setLatitude(parseFloat(addr.latitude) || -6.2088);
    setLongitude(parseFloat(addr.longitude) || 106.8456);
    setIsDefault(addr.is_default || false);
    setFormError('');
    setIsFormOpen(true);
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setFormError('');
  };

  const handleCoordinateChange = (lat, lng, addressSnippet) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addressSnippet && !fullAddress) {
      setFullAddress(addressSnippet);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !fullAddress.trim()) {
      setFormError('Harap lengkapi nama penerima, nomor HP/WhatsApp, dan alamat lengkap.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        label,
        recipient_name: recipientName,
        phone_number: phoneNumber,
        full_address: fullAddress,
        province,
        city,
        district,
        postal_code: postalCode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        is_default: isDefault
      };

      let res;
      if (editingAddress?.id) {
        res = await api.put(`/addresses/${editingAddress.id}`, payload);
      } else {
        res = await api.post('/addresses', payload);
      }

      if (res.success) {
        showToast(`✓ Alamat ${editingAddress ? 'berhasil diperbarui' : 'berhasil ditambahkan'}!`);
        setIsFormOpen(false);
        setEditingAddress(null);
        fetchAddresses();
      } else {
        setFormError(res.message || 'Gagal menyimpan alamat.');
      }
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan sistem saat menyimpan alamat.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/addresses/${id}/default`);
      if (res.success) {
        showToast('✓ Alamat utama default berhasil diperbarui!');
        fetchAddresses();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah alamat default.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.success) {
        showToast('✓ Alamat berhasil dihapus.');
        fetchAddresses();
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus alamat.');
    }
  };

  const labelPresets = [
    { name: 'Rumah', icon: Home },
    { name: 'Kandang Utama', icon: Warehouse },
    { name: 'Kantor / Toko', icon: Building2 },
    { name: 'Gudang Pakan', icon: Warehouse }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => onNavigate('profile'))}
          className="flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Profil</span>
        </button>

        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Alamat Baru</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-theme-primary/10 text-theme-primary">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-theme-text">Daftar Alamat & Titik Koordinat (Tikor)</h1>
            <p className="text-xs text-theme-muted">
              Kelola alamat rumah, kandang utama peternakan, atau gudang untuk penjemputan armada mandiri GoTernak.
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* INLINE ADD/EDIT FORM (No Modal) */}
      {isFormOpen && (
        <div
          ref={formCardRef}
          className="bg-theme-card border-2 border-theme-primary/30 rounded-3xl p-6 sm:p-8 shadow-md space-y-5 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between border-b border-theme-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-theme-primary/10 text-theme-primary">
                {editingAddress ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-theme-text">
                  {editingAddress ? 'Ubah Alamat & Titik Koordinat' : 'Tambah Alamat Baru (Inline)'}
                </h2>
                <p className="text-[11px] text-theme-muted">
                  Isi detail alamat dan tentukan titik GPS pada peta di bawah ini.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Label Presets */}
            <div>
              <label className="font-bold text-theme-text block mb-1.5">Label Lokasi</label>
              <div className="flex flex-wrap gap-2">
                {labelPresets.map((preset) => {
                  const Icon = preset.icon;
                  const active = label === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setLabel(preset.name)}
                      className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                        active
                          ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                          : 'bg-theme-bg text-theme-text border-theme-border hover:bg-theme-border/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Penerima / Pemilik</label>
                <div className="relative">
                  <User className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="font-bold text-theme-text block mb-1">Alamat Lengkap & Patokan Jalan</label>
              <textarea
                required
                rows={2}
                placeholder="Jl. Raya Tajur No. 45, RT 02/03, Dekat Masjid Al-Ikhlas..."
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30 leading-relaxed"
              />
            </div>

            {/* Province, City, District, Postal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Provinsi</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Kota / Kab</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Kecamatan</label>
                <input
                  type="text"
                  placeholder="Kecamatan"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Kode Pos</label>
                <input
                  type="text"
                  placeholder="16134"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>
            </div>

            {/* Interactive Leaflet Map Picker */}
            <div className="pt-2">
              <label className="font-bold text-theme-text block mb-1.5 flex items-center justify-between">
                <span>Pilih Titik Presisi di Peta (Tikor GPS)</span>
                <span className="font-mono text-[10px] text-theme-muted font-normal">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              </label>

              <LeafletMapPicker
                initialLat={latitude}
                initialLng={longitude}
                onCoordinateSelect={handleCoordinateChange}
                height="260px"
              />
            </div>

            {/* Is Default Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary/30"
                />
                <span className="font-bold text-theme-text">Jadikan sebagai alamat utama (default)</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-border">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2.5 rounded-xl border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg font-bold transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : editingAddress ? 'Perbarui Alamat' : 'Simpan Alamat'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-theme-muted">
          Memuat daftar alamat tersimpan...
        </div>
      ) : addresses.length === 0 && !isFormOpen ? (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-center text-2xl">
            📍
          </div>
          <h3 className="font-extrabold text-sm text-theme-text">Belum Ada Alamat Tersimpan</h3>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            Simpan alamat rumah atau kandang ternak Anda beserta titik koordinat GPS agar pesanan dapat dijemput dan dikirim dengan mudah.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-sm"
          >
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => {
            const hasCoords = addr.latitude && addr.longitude;
            return (
              <div
                key={addr.id}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  addr.is_default
                    ? 'bg-theme-primary-light/20 border-theme-primary/40 shadow-sm'
                    : 'bg-theme-card border-theme-border hover:border-theme-border/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs text-theme-text bg-theme-bg px-2.5 py-1 rounded-xl border border-theme-border">
                      {addr.label || 'Alamat'}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-theme-primary text-white px-2 py-0.5 rounded-full shadow-sm">
                        Alamat Utama
                      </span>
                    )}
                    {hasCoords ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Tikor Terpasang
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Tikor Belum Terpasang
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] font-bold text-theme-primary hover:underline px-2 py-1"
                      >
                        Jadikan Utama
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
                      title="Ubah Alamat"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Alamat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-theme-text flex items-center gap-2">
                    <span>{addr.recipient_name}</span>
                    <span className="text-theme-muted font-normal">• {addr.phone_number}</span>
                  </div>
                  <p className="text-theme-muted leading-relaxed">
                    {addr.full_address}
                  </p>
                  {(addr.district || addr.city || addr.province || addr.postal_code) && (
                    <p className="text-[11px] text-theme-muted font-semibold">
                      {[addr.district, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {hasCoords && (
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-theme-border/40">
                    <span className="font-mono text-theme-muted text-[10px]">
                      Tikor: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-theme-primary hover:underline font-bold text-[10px]"
                    >
                      <span>Buka Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
