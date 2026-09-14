// AdminPortalWrapper.jsx — Premium Super Admin Suite · Collapsible Icon/Full Sidebar
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, User, ArrowLeft, Sliders, History,
  Store, Package, Activity, Menu, X, LogOut, AlertCircle,
  Eye, EyeOff, Sparkles, Users, Palette, ChevronLeft,
  ChevronRight, Bell, Search, ExternalLink, LayoutDashboard,
  Zap, Award, Truck, Percent
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
  const { user, login, isAuthenticated, isAdmin, logout } = useAuth();
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
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(username, password);
      if (res.success && res.data.user.role !== 'ADMIN') {
        setError('Akses ditolak. Akun ini bukan Super Admin.'); logout();
      }
    } catch (err) { setError(err.message || 'Kredensial tidak valid.'); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await login('admin', 'Password123!');
      if (res.success && res.data.user.role !== 'ADMIN') {
        setError('Akses ditolak.'); logout();
      }
    } catch (err) { setError(err.message || 'Login demo gagal.'); }
    finally { setLoading(false); }
  };

  const handleNextTheme = () => {
    const idx = availableThemes.findIndex(t => t.id === theme);
    switchTheme(availableThemes[(idx + 1) % availableThemes.length].id);
  };

  /* ────────────────────── LOGIN GATE ──────────────────────────── */
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#060b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Card */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Logo */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Super Admin Panel</h1>
                <p className="text-xs text-slate-500 mt-1">{config.app_name} · Akses Terbatas</p>
              </div>
            </div>

            {/* 1-Click demo */}
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5" />
              {loading ? 'Mengautentikasi...' : '1-Click Masuk sebagai Super Admin'}
            </button>
            <p className="text-[10px] text-slate-600 text-center -mt-3">
              demo: <span className="text-slate-400 font-mono">admin</span> / <span className="text-slate-400 font-mono">Password123!</span>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">atau login manual</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
              </div>
            )}

            {/* Manual form */}
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'} required
                  placeholder="Kata Sandi" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-3 text-xs text-white outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all">
                {loading ? 'Memproses...' : 'Masuk Manual'}
              </button>
            </form>

            <button onClick={onNavigateHome}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors w-full mt-2">
              <ArrowLeft className="w-3 h-3" /> Kembali ke Marketplace
            </button>
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
              <p className="text-[11px] font-bold text-theme-text leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-theme-muted leading-none mt-0.5 font-mono">@{user?.username || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text text-[11px] font-bold transition-colors shadow-sm"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden lg:inline">Marketplace</span>
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Mobile backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR (Full height & collapsible) ───── */}
        <aside
          className={`
            fixed lg:sticky top-14 left-0 z-50
            h-[calc(100vh-3.5rem)] flex flex-col
            bg-theme-card border-r border-theme-border backdrop-blur-xl
            transition-all duration-200 ease-in-out flex-shrink-0
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
            w-64
          `}
        >
          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto pt-1 pb-4 px-2 space-y-0.5">
            <p className={`text-[9px] font-black text-theme-muted uppercase tracking-[0.12em] px-3 pb-2 pt-0.5 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
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
                    <p className="text-[10px] text-theme-muted mt-0.5 leading-none truncate">{item.sub}</p>
                  </div>
                  {isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')} ${sidebarCollapsed ? 'lg:hidden' : 'block'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom user card */}
          <div className="border-t border-theme-border p-2.5 flex-shrink-0">
            {sidebarCollapsed && (
              <div className="hidden lg:flex flex-col items-center gap-2 p-2 rounded-2xl bg-theme-bg border border-theme-border">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-500" title={user?.name || 'Admin'}>
                  A
                </div>
                <button
                  onClick={() => { logout(); onNavigateHome(); }}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
                  <p className="text-[11px] font-extrabold text-theme-text leading-none truncate">{user?.name || 'Super Admin'}</p>
                  <p className="text-[9px] text-emerald-500 font-mono mt-0.5 leading-none font-bold">ROLE: ADMIN</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); onNavigateHome(); }}
                className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0"
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
