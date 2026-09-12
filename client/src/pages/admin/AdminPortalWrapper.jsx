// AdminPortalWrapper.jsx — Premium Super Admin Suite · Collapsible Icon/Full Sidebar
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, User, ArrowLeft, Sliders, History,
  Store, Package, Activity, Menu, X, LogOut, AlertCircle,
  Eye, EyeOff, Sparkles, Users, Palette, ChevronLeft,
  ChevronRight, Bell, Search, ExternalLink, LayoutDashboard,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';
import { useTheme } from '../../context/ThemeContext';
import AdminDashboardPage from './AdminDashboardPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminLivestockPage from './AdminLivestockPage';
import AdminMarketingPage from './AdminMarketingPage';
import AdminUsersPage from './AdminUsersPage';
import BrandingSettingsPage from './BrandingSettingsPage';
import AuditLogsPage from './AuditLogsPage';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', sub: 'Analitik & Ringkasan', icon: LayoutDashboard, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  { id: 'marketing', label: 'Marketing', sub: 'Hero, Promo & Ulasan', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
  { id: 'orders', label: 'Pesanan', sub: 'Kelola Semua Order', icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  { id: 'livestock', label: 'Ternak', sub: 'Katalog Hewan & SKKH', icon: Store, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  { id: 'users', label: 'Pengguna', sub: 'User, Role & Akses', icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
  { id: 'settings', label: 'Pengaturan', sub: 'Branding & Ekspedisi', icon: Sliders, color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30' },
  { id: 'audit-logs', label: 'Audit Log', sub: 'Riwayat Transaksi', icon: History, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
];

/* ─── Main Export ─────────────────────────────────────────────── */
export default function AdminPortalWrapper({ onNavigateHome }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { user, login, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, switchTheme, availableThemes, enterAdminMode, exitAdminMode } = useTheme();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Desktop: true = full sidebar, false = icon-only mini sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-[#060b14] text-slate-100 flex flex-col w-full overflow-x-hidden">

      {/* ── TOP NAV BAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 lg:px-6
                         bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors items-center justify-center"
            title={sidebarCollapsed ? 'Perluas Sidebar' : 'Minimise Sidebar'}
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm shadow-md shadow-emerald-500/25 flex-shrink-0">
              🐂
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-extrabold text-white leading-none">{config.app_name}</p>
              <p className="text-[10px] text-emerald-400 font-mono leading-none mt-0.5">Super Admin</p>
            </div>
          </div>

          {/* Breadcrumb pill */}
          <div className="hidden md:flex items-center gap-1.5 pl-3 ml-1 border-l border-slate-800">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${activeNav.bg} ${activeNav.color}`}>
              <ActiveIcon className="w-3 h-3" />
              {activeNav.label}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-xs text-emerald-400 font-black">A</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] font-bold text-slate-200 leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-slate-500 leading-none mt-0.5 font-mono">@{user?.username || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-bold transition-colors"
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
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR ───────────────────────────────────────────── */}
        <aside
          className={`
            fixed lg:sticky top-14 left-0 z-50
            h-[calc(100vh-3.5rem)] flex flex-col
            bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl
            transition-all duration-200 ease-in-out flex-shrink-0
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-60'}
            w-60
          `}
        >
          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {!sidebarCollapsed && (
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.12em] px-3 pb-2">
                Menu Utama
              </p>
            )}

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileSidebarOpen(false); }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-xl transition-all duration-150
                    ${sidebarCollapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'}
                    ${isActive
                      ? `${item.bg} border ${item.color} shadow-sm`
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color : ''}`} />
                  {!sidebarCollapsed && (
                    <div className="text-left min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-none truncate ${isActive ? item.color : ''}`}>{item.label}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-none truncate">{item.sub}</p>
                    </div>
                  )}
                  {!sidebarCollapsed && isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom user card */}
          <div className={`border-t border-slate-800/80 p-3 flex-shrink-0 ${sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
            {sidebarCollapsed ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm flex-shrink-0">
                  🐂
                </div>
                <button
                  onClick={() => { logout(); onNavigateHome(); }}
                  className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-base flex-shrink-0">
                    🐂
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-white leading-none truncate">{user?.name || 'Super Admin'}</p>
                    <p className="text-[9px] text-emerald-500 font-mono mt-0.5 leading-none">ROLE: ADMIN</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); onNavigateHome(); }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title="Keluar dari Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">

          {/* Routed content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && <AdminDashboardPage onNavigateTab={tab => setActiveTab(tab)} />}
            {activeTab === 'marketing' && <AdminMarketingPage />}
            {activeTab === 'orders' && <AdminOrdersPage />}
            {activeTab === 'livestock' && <AdminLivestockPage />}
            {activeTab === 'users' && <AdminUsersPage />}
            {activeTab === 'settings' && <BrandingSettingsPage />}
            {activeTab === 'audit-logs' && <AuditLogsPage onBack={() => setActiveTab('dashboard')} />}
          </div>
        </main>
      </div>
    </div>
  );
}
