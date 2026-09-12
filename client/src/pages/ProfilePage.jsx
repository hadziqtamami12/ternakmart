// ProfilePage.jsx - User Profile & Domisili Pinpoint Editor
import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function ProfilePage({ onNavigate }) {
  const { setDocumentTitle } = useAppConfig();
  const { user, logout, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');
  const [latitude, setLatitude] = useState(user?.latitude || -6.2088);
  const [longitude, setLongitude] = useState(user?.longitude || 106.8456);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDocumentTitle('Profil Akun');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        name,
        phone_number: phoneNumber,
        address,
        latitude,
        longitude
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-theme-muted text-xs">Silakan login untuk melihat profil akun.</p>
        <button onClick={() => onNavigate('auth')} className="px-5 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-xl">
          Masuk Akun
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-theme-border pb-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-theme-border shadow-sm"
            />
            <div>
              <h1 className="text-xl font-extrabold text-theme-text">{user.name}</h1>
              <p className="text-xs text-theme-muted">@{user.username} • {user.email}</p>
              <span className="inline-block mt-1 bg-theme-primary-light text-theme-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Peran: {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); onNavigate('auth'); }}
            className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        {saved && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profil dan lokasi berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-theme-text block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Alamat Domisili Lengkap</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">
              Link Google Maps Lokasi (contoh: https://maps.app.goo.gl/xxxx)
            </label>
            <input
              type="text"
              placeholder="https://maps.app.goo.gl/..."
              value={user?.maps_url || ''}
              onChange={(e) => {
                const url = e.target.value;
                const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                  setLatitude(parseFloat(match[1] || match[3]));
                  setLongitude(parseFloat(match[2] || match[4]));
                }
              }}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text"
            />
            <p className="text-[10px] text-theme-muted mt-1">
              Koordinat terpasang: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all shadow-theme-primary/30"
            >
              {saving ? 'Menyimpan...' : 'Perbarui Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
