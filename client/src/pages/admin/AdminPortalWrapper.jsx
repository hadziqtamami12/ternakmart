// AdminPortalWrapper.jsx — Premium Super Admin Suite · Collapsible Icon/Full Sidebar
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, User, ArrowLeft, Sliders, History,
  Store, Package, Activity, Menu, X, LogOut, AlertCircle,
  Eye, EyeOff, Sparkles, Users, Palette, ChevronLeft,
  ChevronRight, Bell, Search, ExternalLink, LayoutDashboard,
  Zap, Award, Truck, Percent, CheckCircle2, Shield, FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';
import { useTheme } from '../../context/ThemeContext';
import AdminDashboardPage from './AdminDashboardPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminLivestockPage from './AdminLivestockPage';
import AdminMarketingPage from './AdminMarketingPage';
import AdminUsersPage from './AdminUsersPage';
import AdminBadgesPage from './AdminBadgesPage';
import AdminPromosPage from './AdminPromosPage';
import AdminShippingSettingsPage from './AdminShippingSettingsPage';
import BrandingSettingsPage from './BrandingSettingsPage';
import AuditLogsPage from './AuditLogsPage';
import AdminHeroBannersPage from './AdminHeroBannersPage';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', sub: 'Analitik & Ringkasan', icon: LayoutDashboard, color: 'text-emerald-500', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  { id: 'hero-banners', label: 'Hero Banners', sub: 'Kelola Slider Beranda', icon: Sliders, color: 'text-indigo-500', bg: 'bg-indigo-500/15 border-indigo-500/30' },
  { id: 'promos', label: 'Promo & Diskon', sub: 'Event & Kupon Ternak', icon: Percent, color: 'text-rose-500', bg: 'bg-rose-500/15 border-rose-500/30' },
  { id: 'marketing', label: 'Marketing', sub: 'Popup Event & Ulasan', icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/15 border-violet-500/30' },
  { id: 'orders', label: 'Pesanan', sub: 'Kelola Semua Order', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/15 border-blue-500/30' },
  { id: 'livestock', label: 'Ternak', sub: 'Katalog Hewan & SKKH', icon: Store, color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' },
  { id: 'users', label: 'Pengguna', sub: 'User, Role & Akses', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/15 border-pink-500/30' },
  { id: 'badges', label: 'Tier Badge', sub: 'Kelola Tingkatan Tier', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  { id: 'shipping-settings', label: 'Pengiriman', sub: 'GoTernak & Ekspedisi', icon: Truck, color: 'text-teal-500', bg: 'bg-teal-500/15 border-teal-500/30' },
  { id: 'settings', label: 'Pengaturan', sub: 'Branding & Platform', icon: Sliders, color: 'text-sky-500', bg: 'bg-sky-500/15 border-sky-500/30' },
  { id: 'audit-logs', label: 'Audit Log', sub: 'Riwayat Transaksi', icon: History, color: 'text-orange-500', bg: 'bg-orange-500/15 border-orange-500/30' },
];

function getAdminTabFromPath() {
  const path = window.location.pathname.toLowerCase();
  const sub = path.replace(/^\/admin\/?/, '').split('/')[0];
  if (!sub || sub === 'dashboard') return 'dashboard';
  if (sub === 'hero-banners' || sub === 'hero-banner') return 'hero-banners';
  if (sub === 'promos' || sub === 'promo') return 'promos';
  if (sub === 'marketing') return 'marketing';
  if (sub === 'orders' || sub === 'pesanan') return 'orders';
  if (sub === 'livestock' || sub === 'ternak') return 'livestock';
  if (sub === 'users' || sub === 'user') return 'users';
  if (sub === 'badges' || sub === 'badge') return 'badges';
  if (sub === 'shipping-settings' || sub === 'pengiriman') return 'shipping-settings';
  if (sub === 'settings' || sub === 'pengaturan') return 'settings';
  if (sub === 'audit-logs' || sub === 'audit') return 'audit-logs';
  return 'dashboard';
}

/* ─── Main Export ─────────────────────────────────────────────── */
export default function AdminPortalWrapper({ onNavigateHome }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { adminUser, adminLogin, isAdminAuthenticated, adminLogout } = useAuth();
  const { theme, switchTheme, availableThemes, enterAdminMode, exitAdminMode } = useTheme();

  const [activeTab, setActiveTab] = useState(() => getAdminTabFromPath());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Desktop: true = full sidebar, false = icon-only mini sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Sync URL with activeTab on popstate */
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.toLowerCase().startsWith('/admin')) {
        const tab = getAdminTabFromPath();
        setActiveTab(tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
    const targetPath = tabId === 'dashboard' ? '/admin' : `/admin/${tabId}`;
    if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
      window.history.pushState({}, '', targetPath);
    }
  };

  /* Isolate admin from marketplace theme */
  useEffect(() => {
    enterAdminMode();
    return () => exitAdminMode();
  }, []);

  useEffect(() => { setDocumentTitle('Super Admin'); }, []);

  /* ── Auth handlers ── */
  const handleAdminLogout = () => {
    adminLogout();
    if (window.location.pathname.toLowerCase() !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setActiveTab('dashboard');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await adminLogin(username, password);
      if (res.success) {
        if (window.location.pathname.toLowerCase() !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
        setActiveTab('dashboard');
      }
    } catch (err) { setError(err.message || 'Kredensial tidak valid.'); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminLogin('admin', 'Password123!');
      if (res.success) {
        if (window.location.pathname.toLowerCase() !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
        setActiveTab('dashboard');
      }
    } catch (err) { setError(err.message || 'Login demo gagal.'); }
    finally { setLoading(false); }
  };

  const handleFillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const handleNextTheme = () => {
    const idx = availableThemes.findIndex(t => t.id === theme);
    switchTheme(availableThemes[(idx + 1) % availableThemes.length].id);
  };

  /* ────────────────────── LIVESTOCK THEMED LOGIN GATE ──────────────────────────── */
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#040e09] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[140px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-teal-600/5 blur-[160px]" />
        </div>

        {/* Main Portal Card */}
        <div className="relative w-full max-w-5xl bg-slate-900/90 border border-emerald-500/30 rounded-3xl sm:rounded-[32px] shadow-2xl shadow-emerald-950/60 overflow-hidden backdrop-blur-2xl flex flex-col lg:flex-row">
          
          {/* Left Hero Livestock Showcase (Desktop) */}
          <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden border-r border-emerald-500/20">
            {/* Background Livestock Pastoral Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1600&auto=format&fit=crop&q=85')`
              }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040e09] via-[#040e09]/85 to-[#040e09]/75 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-[#040e09]/90" />

            {/* Top Brand Pill */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-emerald-500/40 backdrop-blur-md shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span className="text-[11px] font-black tracking-widest text-emerald-300 uppercase">
                  Ternakmart Live Operations
                </span>
              </div>
            </div>

            {/* Center Content */}
            <div className="relative z-10 my-auto py-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-xl shadow-emerald-600/30 border border-emerald-400/40">
                    🐂
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                      {config.app_name || 'Ternakmart'}
                    </h2>
                    <p className="text-xs font-extrabold text-emerald-400 font-mono tracking-wider mt-1 uppercase">
                      Pusat Komando Pasar Ternak
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Panel manajemen terpadu ekosistem perdagangan hewan ternak, logistik armada berstandar veteriner, dan verifikasi SKKH digital Indonesia.
                </p>
              </div>

              {/* Livestock Pillars */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Validasi Kesehatan & SKKH</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pengawasan rekam medis hewan, riwayat vaksin, dan sertifikasi bebas PMK.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Logistik Armada Mandiri</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Monitoring checkpoint rest-stop pakan dan pengiriman hewan hidup.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Rekonsiliasi Escrow & Peternak</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pengendalian transaksi aman, kupon qurban, dan verifikasi mitra peternakan.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Protokol TLS 1.3 · Akses Terisolasi
              </span>
              <span className="font-mono text-[10px] text-emerald-500 font-bold">v1.0.0-PROD</span>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6 relative bg-slate-900/95">
            {/* Header / Brand */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-2xl">
                  🐂
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Super Admin Portal</h1>
                  <p className="text-xs text-emerald-400 font-bold">Otoritas Pusat Operasional Ternakmart</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Silakan masuk dengan kredensial administrator untuk mengelola seluruh data platform.
              </p>
            </div>

            {/* 1-Click Fast Admin Access */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Akses Cepat Super Admin
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Klik Siap Masuk</span>
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60 transform active:scale-[0.99] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                {loading ? 'Mengautentikasi Akun...' : 'Masuk Langsung sebagai Super Admin'}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Kredensial Default:</span>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <button 
                    type="button"
                    onClick={() => handleFillCredentials('admin', 'Password123!')}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold border border-slate-700 cursor-pointer"
                    title="Klik untuk isi formulir"
                  >
                    user: admin
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleFillCredentials('admin', 'Password123!')}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold border border-slate-700 cursor-pointer"
                    title="Klik untuk isi formulir"
                  >
                    pw: Password123!
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">atau login manual</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Gagal Masuk</p>
                  <p className="text-[11px] text-rose-300 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Username atau Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: admin atau admin@ternakmart.id"
                    className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi administrator"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
                    title={showPw ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Masuk ke Konsol Admin</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Marketplace */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Kembali ke Pasar Ternakmart
              </button>
              <span className="text-[10px] text-slate-500 font-mono">Panel Otoritas</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────── ADMIN DASHBOARD ─────────────────────── */
  const activeNav = NAV_ITEMS.find(n => n.id === activeTab) || NAV_ITEMS[0];
  const ActiveIcon = activeNav.icon;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col w-full h-screen overflow-hidden">

      {/* ── TOP NAV BAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 lg:px-6
                         bg-theme-card/90 backdrop-blur-xl border-b border-theme-border flex-shrink-0 text-theme-text">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors items-center justify-center shadow-xs"
            title={sidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            aria-label="Toggle Sidebar Admin"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm shadow-md shadow-emerald-500/25 flex-shrink-0">
              🐂
            </div>
            <div>
              <p className="text-sm font-extrabold text-theme-text leading-none">{config.app_name}</p>
              <p className="text-[10px] text-emerald-500 font-mono leading-none mt-0.5 font-bold">Super Admin</p>
            </div>
          </div>

          {/* Breadcrumb pill */}
          {/* <div className="hidden md:flex items-center gap-1.5 pl-3 ml-1 border-l border-theme-border">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${activeNav.bg} ${activeNav.color}`}>
              <ActiveIcon className="w-3 h-3" />
              {activeNav.label}
            </div>
          </div> */}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-theme-border">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-xs text-emerald-500 font-black">A</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] font-bold text-theme-text leading-none">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[9px] text-theme-muted leading-none mt-0.5 font-mono">@{adminUser?.username || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text text-[11px] font-bold transition-colors shadow-sm"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden lg:inline">Marketplace</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
            title="Keluar dari Admin (Akan diarahkan ke Login Admin)"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Mobile backdrop (covers entire screen including topbar) */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── SIDEBAR (Full height drawer on mobile, collapsible on desktop) ───── */}
        <aside
          className={`
            fixed lg:sticky inset-y-0 lg:top-14 left-0 z-[80] lg:z-30
            h-[100dvh] lg:h-[calc(100vh-3.5rem)] flex flex-col
            bg-theme-card border-r border-theme-border backdrop-blur-xl
            transition-all duration-300 ease-in-out flex-shrink-0 shadow-2xl lg:shadow-none
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
            w-[280px] sm:w-72
          `}
        >
          {/* Mobile Drawer Header (Covers topbar completely on mobile) */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-theme-border bg-theme-bg/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-base shadow-md shadow-emerald-500/25 flex-shrink-0">
                🐂
              </div>
              <div>
                <p className="text-sm font-black text-theme-text leading-tight">{config.app_name}</p>
                <p className="text-[10px] text-emerald-500 font-mono font-bold leading-tight">Super Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
              title="Tutup Menu"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto overscroll-contain pt-2 pb-4 px-2 space-y-1">
            <p className={`text-[9px] font-black text-theme-muted uppercase tracking-[0.12em] px-3 pb-2 pt-1 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
              Menu Utama
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={item.label}
                  className={`
                    w-full flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'gap-3 px-3'} rounded-xl transition-all duration-150 py-2.5
                    ${isActive
                      ? `${item.bg} border ${item.color} shadow-sm font-bold`
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-transparent'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color : ''}`} />
                  <div className={`text-left min-w-0 flex-1 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                    <p className={`text-xs leading-none truncate ${isActive ? 'font-black ' + item.color : 'font-semibold'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-theme-muted mt-1 leading-none truncate">{item.sub}</p>
                  </div>
                  {isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')} ${sidebarCollapsed ? 'lg:hidden' : 'block'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom user & action card */}
          <div className="border-t border-theme-border p-3 flex-shrink-0 bg-theme-card space-y-2">
            {/* Mobile Quick Action to Marketplace */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onNavigateHome();
              }}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text text-xs font-bold transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>Buka Marketplace</span>
            </button>

            {sidebarCollapsed && (
              <div className="hidden lg:flex flex-col items-center gap-2 p-2 rounded-2xl bg-theme-bg border border-theme-border">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-500" title={adminUser?.name || 'Super Admin'}>
                  A
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Keluar dari Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className={`items-center justify-between gap-2 p-2.5 rounded-2xl bg-theme-bg border border-theme-border ${sidebarCollapsed ? 'lg:hidden flex' : 'flex'}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-base flex-shrink-0">
                  🐂
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-theme-text leading-none truncate">{adminUser?.name || 'Super Admin'}</p>
                  <p className="text-[9px] text-emerald-500 font-mono mt-0.5 leading-none font-bold">ROLE: ADMIN</p>
                </div>
              </div>
              <button
                onClick={handleAdminLogout}
                className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0 cursor-pointer"
                title="Keluar dari Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT (Scrolls independently) ──────────────── */}
        <main className="flex-1 min-w-0 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden bg-theme-bg">

          {/* Routed content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && <AdminDashboardPage onNavigateTab={handleTabChange} />}
            {activeTab === 'hero-banners' && <AdminHeroBannersPage />}
            {activeTab === 'promos' && <AdminPromosPage />}
            {activeTab === 'marketing' && <AdminMarketingPage />}
            {activeTab === 'orders' && <AdminOrdersPage />}
            {activeTab === 'livestock' && <AdminLivestockPage />}
            {activeTab === 'users' && <AdminUsersPage />}
            {activeTab === 'badges' && <AdminBadgesPage />}
            {activeTab === 'shipping-settings' && <AdminShippingSettingsPage />}
            {activeTab === 'settings' && <BrandingSettingsPage />}
            {activeTab === 'audit-logs' && <AuditLogsPage onBack={() => handleTabChange('dashboard')} />}
          </div>
        </main>
      </div>
    </div>
  );
}
