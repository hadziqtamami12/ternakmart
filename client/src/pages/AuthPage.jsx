// AuthPage.jsx - Login, Registration with Pinpoint GPS & 1-Click Demo Switcher
import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function AuthPage({ onNavigate, redirectPage, redirectParams }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { login, register, logout } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState('BUYER');

  React.useEffect(() => {
    setDocumentTitle(mode === 'login' ? 'Masuk Akun' : 'Daftar Akun Baru');
  }, [mode]);

  const handleSuccessRedirect = () => {
    const saved = sessionStorage.getItem('ternakmart_redirect_url');
    sessionStorage.removeItem('ternakmart_redirect_url');
    if (saved) {
      onNavigate(saved);
    } else if (redirectPage) {
      onNavigate(redirectPage, redirectParams);
    } else {
      onNavigate('home');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        if (res.data?.user?.role === 'ADMIN') {
          logout();
          setError('Akun Administrator tidak diizinkan masuk melalui halaman customer. Silakan gunakan portal khusus Backoffice di /admin.');
          return;
        }
        handleSuccessRedirect();
      }
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email/username dan sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({
        name: regName,
        username: regUsername,
        email: regEmail,
        phone_number: regPhone,
        password: regPassword,
        address: regAddress,
        role: regRole
      });
      if (res.success) {
        handleSuccessRedirect();
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan akun.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = async (demoIdentifier, demoPass) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      const res = await login(demoIdentifier, demoPass);
      if (res.success) {
        if (res.data?.user?.role === 'ADMIN') {
          logout();
          setError('Akun Administrator tidak diizinkan masuk melalui portal customer. Silakan gunakan /admin.');
          return;
        }
        handleSuccessRedirect();
      }
    } catch (err) {
      setError(err.message || 'Login demo gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Branding & 1-Click Demo Accounts & Buka Toko (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={config.app_logo_url}
                alt={config.app_name}
                className="w-12 h-12 rounded-2xl object-cover border border-theme-border shadow-sm"
              />
              <div>
                <h2 className="text-lg font-extrabold text-theme-text">{config.app_name}</h2>
                <p className="text-xs text-theme-muted">Peternakan & Logistik Armada</p>
              </div>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              Masuk atau daftar untuk memesan hewan ternak bersertifikat SKKH resmi, melacak truk kurir secara live, atau membuka toko peternakan.
            </p>

            {/* Peternakan Info Banner */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-1.5">
              <div className="flex items-center gap-2 text-theme-primary font-bold text-xs">
                <span>🐂</span>
                <span>Marketplace Resmi Hewan Ternak Ber-SKKH</span>
              </div>
              <p className="text-[11px] text-theme-muted leading-relaxed">
                Jual beli Sapi, Domba, dan Kambing aman bergaransi timbangan akurat. Masuk untuk mulai bertransaksi atau membuka kandang ternak Anda.
              </p>
            </div>

            {/* Quick Demo Access (Customer / Seller / Courier ONLY - Super Admin moved to /admin) */}
            <div className="pt-2 border-t border-theme-border space-y-2">
              <span className="text-[11px] font-bold text-theme-primary uppercase tracking-wider block">
                ⚡ 1-Click Akses Demo Cepat:
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('barokahfarm', 'Password123!')}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all"
                >
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400">🏡 Peternak (Barokah Farm)</div>
                  <div className="text-[10px] text-theme-muted">Kelola kandang & stok hewan</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('bambangcourier', 'Password123!')}
                  className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all"
                >
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400">🚚 Kurir Armada Ternak</div>
                  <div className="text-[10px] text-theme-muted">Simulasi rute armada & antar ternak</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('fauzirahman', 'Password123!')}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all"
                >
                  <div className="text-xs font-bold text-purple-700 dark:text-purple-400">👤 Pembeli / Buyer</div>
                  <div className="text-[10px] text-theme-muted">Checkout & lacak status pesanan</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Forms (7 cols) */}
        <div className="md:col-span-7 bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-theme-bg rounded-2xl border border-theme-border">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-theme-card text-theme-primary shadow-sm' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-theme-card text-theme-primary shadow-sm' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text block">Email atau Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="nama@email.com atau username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-2xl pl-10 pr-4 py-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                  <User className="w-4 h-4 text-theme-muted absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-theme-text block">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-2xl pl-10 pr-10 py-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                  <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-theme-muted hover:text-theme-text transition-colors"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
              >
                {loading ? 'Memeriksa Kredensial...' : 'Masuk ke Platform'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form with Coordinates */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-theme-text block">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-theme-text block">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="budisantoso"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-theme-text block">Email Aktif</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-theme-text block">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    required
                    placeholder="+628123456789"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-theme-text block">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 8 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-3 pr-10 py-2 text-xs text-theme-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-theme-muted hover:text-theme-text transition-colors"
                    title={showRegPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-theme-text block">Peran Pendaftaran Akun</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-semibold"
                >
                  <option value="BUYER">Pembeli / Konsumen Ternak</option>
                  <option value="SELLER">Peternak / Pemilik Kandang</option>
                  <option value="COURIER">Mitra Driver Armada Ternak</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-theme-text block">Alamat Domisili Lengkap</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat jalan, nomor, RT/RW, kota domisili"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5 text-xs text-theme-text"
                />
                <p className="text-[10px] text-theme-muted mt-1">
                  💡 Titik peta / GPS dapat diaktifkan otomatis dengan 1 klik setelah masuk akun.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-3"
              >
                {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
