// OpenStoreModal.jsx - Universal Seller Onboarding Modal with Pickup Address Selector
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Store,
  MapPin,
  CheckCircle2,
  Phone,
  Building2,
  ArrowRight,
  Plus
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function OpenStoreModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenAddAddress
}) {
  if (!isOpen) return null;

  const { user, refreshUser } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone_number || '');
  const [pickupAddressId, setPickupAddressId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch user addresses with coordinates
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await api.get('/addresses');
        if (res.success && res.data) {
          setAddresses(res.data);
          const defaultAddr = res.data.find(a => a.is_default);
          if (defaultAddr) {
            setPickupAddressId(defaultAddr.id);
          } else if (res.data.length > 0) {
            setPickupAddressId(res.data[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not load user addresses:', err.message);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Harap masukkan nama toko atau kandang peternakan Anda.');
      return;
    }

    if (!pickupAddressId && addresses.length > 0) {
      setError('Harap pilih alamat penjemputan armada ternak.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const selectedAddr = addresses.find(a => a.id === pickupAddressId);

      const payload = {
        store_name: storeName.trim(),
        description: description.trim(),
        whatsapp_number: whatsappNumber.trim(),
        pickup_address_id: pickupAddressId || null,
        farm_address: selectedAddr?.full_address || user?.address || 'Alamat Belum Diatur',
        latitude: selectedAddr ? selectedAddr.latitude : user?.latitude,
        longitude: selectedAddr ? selectedAddr.longitude : user?.longitude,
        bank_name: 'BCA',
        bank_account_number: '1234567890'
      };

      const res = await api.post('/stores/register', payload);
      if (res.success) {
        if (refreshUser) await refreshUser();
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Gagal mendaftarkan toko.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem saat membuka toko.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] min-h-[100dvh] h-screen w-screen flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      {/* Full screen backdrop scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 min-h-[100dvh] h-screen w-screen bg-black/40 backdrop-blur-sm -z-10 cursor-pointer"
      />

      <div className="bg-theme-card border border-theme-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] my-auto z-10">
        {/* Header */}
        <div className="p-5 border-b border-theme-border flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-primary text-white shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-theme-text">Buka Toko Kandang Gratis</h2>
              <p className="text-[11px] text-theme-muted">Mulai pasarkan hewan ternak Anda ke ribuan pembeli di Indonesia.</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="font-bold text-theme-text block mb-1">
              Nama Toko / Peternakan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kandang Berkah Jaya, Sentra Domba Garut"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp Operasional</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="081234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <Phone className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Deskripsi Singkat Peternakan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan jenis hewan ternak yang Anda budidayakan (sapi limosin, domba garut, kambing etawa, dsb.)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
          </div>

          {/* Pickup Address Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-theme-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                <span>Alamat Penjemputan / Kandang Utama</span>
              </label>
              {onOpenAddAddress && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddAddress();
                  }}
                  className="text-[11px] font-bold text-theme-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah Alamat
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <p className="text-[11px] text-theme-muted py-2">Memuat daftar alamat...</p>
            ) : addresses.length === 0 ? (
              <div className="p-3.5 rounded-2xl border border-dashed border-theme-border bg-theme-bg/50 text-center space-y-2">
                <p className="text-[11px] text-theme-muted">
                  Anda belum memiliki alamat tersimpan dengan titik koordinat peta (Tikor).
                </p>
                {onOpenAddAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddAddress();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-theme-primary text-white font-bold text-[11px]"
                  >
                    Pasang Alamat & Titik Peta Sekarang
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={pickupAddressId}
                  onChange={(e) => setPickupAddressId(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label} — {addr.recipient_name} ({addr.city || addr.province})
                    </option>
                  ))}
                </select>

                {pickupAddressId && (
                  <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border/60 text-[11px] text-theme-muted flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="leading-snug">
                      {addresses.find(a => a.id === pickupAddressId)?.full_address}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
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
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Membuka Toko...</span>
              </>
            ) : (
              <>
                <span>Buka Toko Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
