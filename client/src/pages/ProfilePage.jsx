// ProfilePage.jsx - Polished Profile, Complete Edit Profile Hub, Verification Tracking, and Clean Logout
import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Shield,
  LogOut,
  CheckCircle2,
  Store,
  Package,
  MessageCircle,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Mail,
  Camera,
  Upload,
  Clock,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import TierBadge from '../components/common/TierBadge';
import AddressListPage from '../components/common/AddressListPage';
import { api } from '../utils/api';

export default function ProfilePage({ onNavigate }) {
  const { setDocumentTitle } = useAppConfig();
  const { user, logout, updateProfile, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/addresses')) {
      return 'addresses';
    }
    return 'overview';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    setDocumentTitle('Profil Saya');
    if (refreshUser) refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto profil maksimal 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setProfileError('');
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);
      } else {
        setProfileError('Gagal mengunggah foto profil.');
      }
    } catch (err) {
      setProfileError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setProfileError('');
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        avatar_url: avatarUrl
      });
      setSaved(true);
      if (refreshUser) await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    onNavigate('auth');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-theme-primary/10 flex items-center justify-center text-3xl">
          👤
        </div>
        <h2 className="text-lg font-black text-theme-text">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-theme-muted text-xs">Akses pesanan, riwayat negosiasi, dan kelola peternakan Anda.</p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 bg-theme-primary text-white text-xs font-black rounded-2xl shadow-sm hover:bg-theme-primary-hover transition-all"
        >
          Masuk / Daftar Akun
        </button>
      </div>
    );
  }

  // If viewing addresses sub-view
  if (activeTab === 'addresses') {
    return (
      <AddressListPage
        onBack={() => setActiveTab('overview')}
        onNavigate={onNavigate}
      />
    );
  }

  const hasRegisteredStore = Boolean(user.store || user.has_store);
  const isStoreVerified = user.store?.is_verified;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-32">
      {/* 1. Header Profile Banner Card */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-theme-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-theme-border/70 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff`}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-theme-border shadow-sm flex-shrink-0"
              />
              <label className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-theme-text truncate leading-tight">
                {user.name}
              </h1>
              <p className="text-xs text-theme-muted truncate">
                @{user.username} • {user.email}
              </p>

              {/* Visual Tier Badge (Customer entities only) */}
              {user.role !== 'ADMIN' && (
                <div className="pt-1">
                  <TierBadge badge={user.badge} size="md" showDescription={true} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('addresses')}
              className="px-3.5 py-2 rounded-2xl bg-theme-bg border border-theme-border hover:bg-theme-border/40 text-theme-text text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MapPin className="w-4 h-4 text-theme-primary" />
              <span>Buku Alamat</span>
            </button>
          </div>
        </div>

        {/* 2. Store Status Banner (Pending vs Verified vs Open Store) */}
        {hasRegisteredStore ? (
          isStoreVerified ? (
            /* STORE VERIFIED */
            <div className="rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-sm flex-shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-theme-text">
                      {user.store?.store_name || 'Kandang Peternakan Anda'}
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted mt-0.5">
                    Toko kandang Anda aktif. Kelola iklan hewan ternak, terima pesanan qurban, dan armada penjemputan GoTernak.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('seller-dashboard')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 flex-shrink-0 shadow-sm transition-all"
              >
                <span>Seller Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* STORE PENDING VERIFICATION */
            <div className="rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-sm flex-shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-theme-text">
                      Pendaftaran Toko Menunggu Approval Admin
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      ⏳ Pending (1x24 Jam)
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted mt-0.5">
                    Data toko '{user.store?.store_name || 'Kandang Mitra'}' sedang ditinjau tim kurasi TernakMart. Dashboard seller akan aktif setelah disetujui.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('register-store')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-2 flex-shrink-0 shadow-sm transition-all"
              >
                <span>Cek Status Verifikasi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )
        ) : (
          /* NOT REGISTERED YET */
          <div className="rounded-2xl p-4 sm:p-5 border border-theme-primary/30 bg-gradient-to-r from-theme-primary/10 via-emerald-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-theme-primary text-white shadow-sm flex-shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-theme-text">
                  Buka Toko Kandang Gratis
                </h3>
                <p className="text-xs text-theme-muted mt-0.5">
                  Daftarkan kandang peternakan Anda untuk menjangkau ribuan pembeli hewan ternak di seluruh Indonesia.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('register-store')}
              className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-black flex items-center gap-2 flex-shrink-0 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Daftar Toko Mitra</span>
            </button>
          </div>
        )}

        {/* 3. Complete Edit Profile Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
              <User className="w-4 h-4 text-theme-primary" />
              <span>Edit Informasi Profil & Kontak</span>
            </h3>
            {uploadingAvatar && (
              <span className="text-[11px] text-theme-primary animate-pulse font-bold">
                Mengunggah foto profil...
              </span>
            )}
          </div>

          {saved && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Data profil berhasil diperbarui!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp / HP *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                </div>
              </div>

              {/* Avatar URL / Upload */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Foto Profil (URL / Unggah)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-theme-text font-bold text-xs flex items-center gap-1 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-theme-border">
              <button
                type="submit"
                disabled={saving || uploadingAvatar}
                className="px-6 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Quick Shortcut Menus Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-primary/40 cursor-pointer shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-theme-text block">Pesanan Saya</span>
              <span className="text-[10px] text-theme-muted">Riwayat transaksi & resi</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('chat')}
          className="p-5 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-primary/40 cursor-pointer shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-theme-text block">Negosiasi Chat</span>
              <span className="text-[10px] text-theme-muted">Tawar langsung peternak</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
        </div>

        <div
          onClick={() => setActiveTab('addresses')}
          className="p-5 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-primary/40 cursor-pointer shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-theme-text block">Buku Alamat (Tikor)</span>
              <span className="text-[10px] text-theme-muted">Titik peta GPS antar/jemput</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
        </div>
      </div>

      {/* 5. Clean Destructive Logout Button */}
      <div className="pt-4 border-t border-theme-border">
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 text-rose-600 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog with Full Height Backdrop */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 min-h-screen h-[100dvh] w-full flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-theme-text">Konfirmasi Logout</h3>
              <p className="text-xs text-theme-muted">
                Apakah Anda yakin ingin mengakhiri sesi login akun TernakMart di perangkat ini?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 rounded-xl border border-theme-border text-theme-text hover:bg-theme-bg font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
