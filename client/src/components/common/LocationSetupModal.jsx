// LocationSetupModal.jsx - Guided Onboarding Dialog for Missing User Location
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import LocationPicker from './LocationPicker';

export default function LocationSetupModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [coords, setCoords] = useState({
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
    address: user?.address || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSaveLocation = async () => {
    if (!coords.latitude || !coords.longitude) {
      setError('Mohon tentukan titik lokasi via GPS atau tautan Google Maps sebelum menyimpan.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await api.put('/auth/profile', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: coords.address || user?.address || 'Alamat Terdaftar'
      });

      if (res.success && res.data) {
        if (updateUser) {
          updateUser(res.data);
        }
        if (onClose) onClose();
      } else {
        setError(res.message || 'Gagal menyimpan data lokasi.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan lokasi.');
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] min-h-[100dvh] h-screen w-screen bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Full screen backdrop scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 min-h-[100dvh] h-screen w-screen bg-black/40 backdrop-blur-sm -z-10 cursor-pointer"
      />

      <div className="w-full max-w-lg bg-theme-card border border-theme-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative my-auto z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-theme-muted hover:text-theme-text rounded-full hover:bg-theme-bg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-theme-primary flex-shrink-0">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Wajib untuk Ongkir Armada
            </div>
            <h3 className="text-base font-extrabold text-theme-text">
              Tentukan Titik Lokasi Anda
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Halo <strong className="text-theme-text">{user?.name}</strong>! Titik lokasi akurat diperlukan agar sistem dapat menghitung biaya kirim armada hewan ternak secara presisi & aman.
            </p>
          </div>
        </div>

        {/* Reusable Location Picker */}
        <LocationPicker
          value={coords}
          onChange={(newCoords) => {
            setCoords(newCoords);
            setError('');
          }}
          label="Pilih Lokasi Rumah / Domisili Anda"
          required
        />

        {error && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-theme-muted font-bold text-xs transition-all"
          >
            Nanti Saja
          </button>

          <button
            type="button"
            onClick={handleSaveLocation}
            disabled={saving || !coords.latitude || !coords.longitude}
            className="flex-1 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Simpan & Aktifkan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
