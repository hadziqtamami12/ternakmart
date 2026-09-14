// AddressFormModal.jsx - Add/Edit Address with Interactive Leaflet Map Tikor Pinpoint
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, CheckCircle2, Home, Building2, Warehouse, Phone, User } from 'lucide-react';
import LeafletMapPicker from './LeafletMapPicker';
import { api } from '../../utils/api';

export default function AddressFormModal({
  isOpen,
  onClose,
  addressToEdit = null,
  onSaved
}) {
  if (!isOpen) return null;

  const [label, setLabel] = useState(addressToEdit?.label || 'Rumah');
  const [recipientName, setRecipientName] = useState(addressToEdit?.recipient_name || '');
  const [phoneNumber, setPhoneNumber] = useState(addressToEdit?.phone_number || '');
  const [fullAddress, setFullAddress] = useState(addressToEdit?.full_address || '');
  const [province, setProvince] = useState(addressToEdit?.province || 'Jawa Barat');
  const [city, setCity] = useState(addressToEdit?.city || 'Bogor');
  const [district, setDistrict] = useState(addressToEdit?.district || '');
  const [postalCode, setPostalCode] = useState(addressToEdit?.postal_code || '');
  const [latitude, setLatitude] = useState(addressToEdit?.latitude || -6.2088);
  const [longitude, setLongitude] = useState(addressToEdit?.longitude || 106.8456);
  const [isDefault, setIsDefault] = useState(addressToEdit?.is_default || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCoordinateChange = (lat, lng, addressSnippet) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addressSnippet && !fullAddress) {
      setFullAddress(addressSnippet);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !fullAddress.trim()) {
      setError('Harap lengkapi nama penerima, nomor WhatsApp/HP, dan alamat lengkap.');
      return;
    }

    setLoading(true);
    setError('');
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
      if (addressToEdit?.id) {
        res = await api.put(`/addresses/${addressToEdit.id}`, payload);
      } else {
        res = await api.post('/addresses', payload);
      }

      if (res.success) {
        if (onSaved) onSaved(res.data);
        onClose();
      } else {
        setError(res.message || 'Gagal menyimpan alamat.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan alamat.');
    } finally {
      setLoading(false);
    }
  };

  const labelPresets = [
    { name: 'Rumah', icon: Home },
    { name: 'Kandang Utama', icon: Warehouse },
    { name: 'Kantor / Toko', icon: Building2 },
    { name: 'Gudang Pakan', icon: Warehouse }
  ];

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] min-h-[100dvh] h-screen w-screen flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      {/* Full screen backdrop scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 min-h-[100dvh] h-screen w-screen bg-black/40 backdrop-blur-sm -z-10 cursor-pointer"
      />

      <div className="bg-theme-card border border-theme-border rounded-3xl w-full max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden my-auto z-10">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-theme-border flex items-center justify-between bg-theme-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-primary/10 text-theme-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-theme-text">
                {addressToEdit ? 'Ubah Alamat & Titik Koordinat' : 'Tambah Alamat Baru'}
              </h2>
              <p className="text-[11px] text-theme-muted">
                Kunci titik koordinat (Tikor) agar kurir GoTernak dapat menghitung ongkir dan menjemput secara presisi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-medium">
              {error}
            </div>
          )}

          {/* Label Presets */}
          <div>
            <label className="font-bold text-theme-text block mb-1.5">Label Alamat</label>
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

          {/* Recipient info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-theme-text block mb-1">Nama Penerima / PIC Kandang</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Syamsul Bahri"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
                <User className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp / HP</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
                <Phone className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Full Address textarea */}
          <div>
            <label className="font-bold text-theme-text block mb-1">Alamat Lengkap & Patokan Jalan</label>
            <textarea
              rows={2}
              required
              placeholder="Nama jalan, nomor rumah/kandang, RT/RW, dan patokan (dekat musholla/gang pohon beringin)..."
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
          </div>

          {/* Regional Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-theme-text block mb-1">Provinsi</label>
              <input
                type="text"
                placeholder="Jawa Barat"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Kota/Kabupaten</label>
              <input
                type="text"
                placeholder="Bogor"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Kecamatan</label>
              <input
                type="text"
                placeholder="Cijeruk"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Kode Pos</label>
              <input
                type="text"
                placeholder="16740"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>
          </div>

          {/* Interactive Leaflet Map Pinpoint */}
          <div className="pt-2">
            <label className="font-bold text-theme-text block mb-1 flex items-center justify-between">
              <span>Titik Koordinat Peta (Tikor Jemput / Antar)</span>
              <span className="text-[10px] text-theme-primary font-bold">Wajib Terpasang Presisi</span>
            </label>
            <LeafletMapPicker
              latitude={latitude}
              longitude={longitude}
              onCoordinateChange={handleCoordinateChange}
              height="240px"
            />
          </div>

          {/* Default address checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-bg border border-theme-border cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-theme-primary focus:ring-theme-primary h-4 w-4"
            />
            <div>
              <span className="font-bold text-theme-text block text-xs">Jadikan Alamat Utama (Default)</span>
              <span className="text-[10px] text-theme-muted block">Alamat ini akan otomatis terpilih saat Anda melakukan checkout ternak.</span>
            </div>
          </label>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-theme-border bg-theme-bg/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-theme-border text-theme-text hover:bg-theme-card font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Alamat...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Alamat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
