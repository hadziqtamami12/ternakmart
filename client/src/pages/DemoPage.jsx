// DemoPage.jsx - Dedicated Testing & QA Sandbox (Accessible only at /demo)
import React, { useState } from 'react';
import {
  ShieldCheck,
  Store,
  Truck,
  User,
  LogOut,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Database,
  Sliders,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function DemoPage({ onNavigate }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { user, login, logout, isAuthenticated } = useAuth();
  const [loadingRole, setLoadingRole] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  React.useEffect(() => {
    setDocumentTitle('Developer & QA Sandbox');
  }, []);

  const handleRoleSwitch = async (roleName, identifier, pass, targetRoute) => {
    setLoadingRole(roleName);
    setStatusMsg('');
    try {
      const res = await login(identifier, pass);
      if (res.success) {
        setStatusMsg(`✓ Berhasil login sebagai ${roleName}!`);
        setTimeout(() => {
          onNavigate(targetRoute);
        }, 600);
      }
    } catch (err) {
      setStatusMsg(`Gagal login: ${err.message}`);
    } finally {
      setLoadingRole('');
    }
  };

  const handleSwitchGuest = () => {
    logout();
    setStatusMsg('✓ Berhasil beralih ke sesi Tamu (Guest)!');
    setTimeout(() => {
      onNavigate('home');
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-32">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 border border-emerald-800/40 rounded-3xl p-8 text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ternakmart Developer & QA Testing Sandbox</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Halaman Khusus Pengujian & Demo Role
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          URL khusus ini (<strong>/demo</strong>) disediakan untuk mempermudah pengujian autentikasi lintas peran, alur transaksi, verifikasi SKKH, dan simulasi pelacakan GPS armada tanpa mengotori antarmuka pelanggan umum.
        </p>

        {/* Current active user status pill */}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-slate-300">Sesi Aktif Saat Ini:</span>
          {isAuthenticated ? (
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
              {user.name} ({user.role})
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-slate-700 text-slate-200 font-bold text-xs">
              Tamu / Guest (Belum Login)
            </span>
          )}
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
            {statusMsg}
          </div>
        )}
      </div>

      {/* 1-Click Role Switchers */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-theme-text">1-Click Beralih Peran (Role Switcher)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Super Admin */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 shadow-sm transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-theme-text">Super Admin</h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                Verifikasi pendaftaran kandang, keabsahan berkas SKKH, pengaturan branding & timezone.
              </p>
              <div className="text-[10px] text-theme-muted font-mono">User: admin | Pass: Password123!</div>
            </div>
            <button
              onClick={() => handleRoleSwitch('Super Admin', 'admin', 'Password123!', 'admin-dashboard')}
              disabled={loadingRole === 'Super Admin'}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{loadingRole === 'Super Admin' ? 'Masuk...' : 'Login & Masuk /admin'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Seller Barokah Farm */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:border-amber-500/50 shadow-sm transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-theme-text">Peternak (Seller)</h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                Kelola ternak kandang, tambah ternak (video 10MB), dan validasi mutasi pembayaran masuk.
              </p>
              <div className="text-[10px] text-theme-muted font-mono">User: barokahfarm | Pass: Password123!</div>
            </div>
            <button
              onClick={() => handleRoleSwitch('Peternak', 'barokahfarm', 'Password123!', 'seller-dashboard')}
              disabled={loadingRole === 'Peternak'}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{loadingRole === 'Peternak' ? 'Masuk...' : 'Login & Masuk Toko'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Courier Armada */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:border-blue-500/50 shadow-sm transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-theme-text">Driver Kurir Armada</h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                Terima tugas penjemputan, kirim update GPS, dan catat checkpoint rest stop pakan hewan.
              </p>
              <div className="text-[10px] text-theme-muted font-mono">User: bambangcourier | Pass: Password123!</div>
            </div>
            <button
              onClick={() => handleRoleSwitch('Kurir', 'bambangcourier', 'Password123!', 'courier-dashboard')}
              disabled={loadingRole === 'Kurir'}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{loadingRole === 'Kurir' ? 'Masuk...' : 'Login & Masuk Kurir'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Buyer Fauzi */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:border-purple-500/50 shadow-sm transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-theme-text">Pembeli (Buyer)</h3>
              <p className="text-xs text-theme-muted leading-relaxed">
                Beli ternak, tawar harga di chat, bayar transfer bank, unggah struk, dan lacak live map.
              </p>
              <div className="text-[10px] text-theme-muted font-mono">User: fauzirahman | Pass: Password123!</div>
            </div>
            <button
              onClick={() => handleRoleSwitch('Pembeli', 'fauzirahman', 'Password123!', 'orders')}
              disabled={loadingRole === 'Pembeli'}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{loadingRole === 'Pembeli' ? 'Masuk...' : 'Login & Masuk Pesanan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reset to Guest Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleSwitchGuest}
            className="px-5 py-2.5 rounded-2xl bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-xs font-bold text-theme-text flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4 text-theme-muted" />
            <span>Keluar & Uji Coba sebagai Pengunjung Tamu (Guest)</span>
          </button>
        </div>
      </div>

      {/* Direct Module Navigation Matrix */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-extrabold text-theme-text">Pintasan Halaman Aplikasi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button onClick={() => onNavigate('home')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            🏠 E-Commerce Homepage (/)
          </button>
          <button onClick={() => onNavigate('catalog')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            🐂 Katalog Ternak Filter (/catalog)
          </button>
          <button onClick={() => onNavigate('cart')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            🛒 Keranjang Belanja (/cart)
          </button>
          <button onClick={() => onNavigate('checkout')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            💳 Checkout Multi-Fee (/checkout)
          </button>
          <button onClick={() => onNavigate('orders')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            📦 Riwayat & Upload Struk (/orders)
          </button>
          <button onClick={() => onNavigate('tracking')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            🚚 Live Map Tracking (/tracking)
          </button>
          <button onClick={() => onNavigate('chat')} className="p-3 rounded-xl bg-theme-bg border border-theme-border text-left font-bold hover:border-theme-primary">
            💬 Tawar & Chat Realtime (/chat)
          </button>
          <button onClick={() => onNavigate('admin-dashboard')} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-left font-bold hover:bg-emerald-500/20">
            🛡️ Super Admin Portal (/admin)
          </button>
        </div>
      </div>
    </div>
  );
}
