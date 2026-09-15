// BrandingSettingsPage.jsx - Website Branding, Expedition Rates, Social Media & Footer Manager
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sliders,
  Upload,
  Globe,
  Palette,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Truck,
  Share2,
  FileText,
  Phone,
  Image,
  Link2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Star,
  ShieldCheck,
  Monitor,
  Smartphone,
  Search,
  ChevronRight,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAppConfig } from '../../context/AppConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { LandingPageSkeleton } from '../../components/common/Skeletons';
import { notifyAdminSuccess, notifyAdminError } from '../../utils/adminAlert';

//* ─── Real Interactive Landing Page Theme Preview (Desktop & Mobile) ─── */
function ThemePreview({ themeId, availableThemes }) {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });
  const [iframeKey, setIframeKey] = useState(0);
  const [isThemeLoading, setIsThemeLoading] = useState(false);
  const iframeRef = useRef(null);

  // Send postMessage to iframe when themeId changes for instantaneous live preview
  useEffect(() => {
    setIsThemeLoading(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'SET_THEME_PREVIEW',
          theme: themeId
        },
        '*'
      );
    }
    const timer = setTimeout(() => {
      setIsThemeLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [themeId]);

  const handleReload = () => {
    setIsThemeLoading(true);
    setIframeKey(k => k + 1);
  };

  const activeThemeObj = availableThemes?.find(x => x.id === themeId) || availableThemes?.[0];

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {/* Switcher Controls: Desktop vs Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300">Mode Pratinjau Interaktif:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live & Bisa Digunakan (Scroll, Cari, Keranjang)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'desktop'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReload}
            title="Muat Ulang Preview"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <a
            href={`/?theme_preview=${themeId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Landing Page di Tab Baru"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center justify-center flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="w-full max-w-full overflow-hidden bg-slate-950 rounded-2xl p-2 sm:p-5 border border-slate-800 flex justify-center items-center">
        {viewMode === 'desktop' ? (
          /* DESKTOP BROWSER FRAME */
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 flex flex-col">
            {/* Browser Header Bar */}
            <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 ml-1.5 hidden sm:inline">
                  Desktop Preview ({activeThemeObj?.name})
                </span>
              </div>

              <div className="flex-1 max-w-md bg-slate-950/90 text-[11px] text-slate-300 rounded-lg px-3 py-1 text-center font-mono border border-slate-800/80 flex items-center justify-center gap-1.5 truncate">
                <span className="text-emerald-400 text-[10px]">🔒</span>
                <span className="truncate">https://ternakmart.id/?theme_preview={themeId}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-mono hidden md:inline flex-shrink-0">
                100% Exact Landing Page
              </div>
            </div>

            {/* Desktop Iframe */}
            <div className="w-full h-[640px] bg-theme-bg relative overflow-hidden">
              {isThemeLoading && (
                <div className="absolute inset-0 z-20 bg-theme-bg">
                  <LandingPageSkeleton viewMode="desktop" />
                </div>
              )}
              <iframe
                key={`desktop-${iframeKey}`}
                ref={iframeRef}
                src={`/?theme_preview=${themeId}`}
                title="Interactive Desktop Theme Preview"
                onLoad={() => setIsThemeLoading(false)}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          /* MOBILE SMARTPHONE FRAME */
          <div className="w-full max-w-[375px] mx-auto rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[8px] border-slate-800 shadow-2xl bg-slate-900 relative flex flex-col">
            {/* Phone Top Notch / Dynamic Island */}
            <div className="h-6 bg-slate-900 flex items-center justify-center relative flex-shrink-0">
              <div className="w-24 sm:w-28 h-3 bg-black rounded-b-xl flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-7 sm:w-9 h-1 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Mobile Iframe */}
            <div className="w-full h-[640px] bg-theme-bg relative overflow-hidden">
              {isThemeLoading && (
                <div className="absolute inset-0 z-20 bg-theme-bg">
                  <LandingPageSkeleton viewMode="mobile" />
                </div>
              )}
              <iframe
                key={`mobile-${iframeKey}`}
                ref={iframeRef}
                src={`/?theme_preview=${themeId}`}
                title="Interactive Mobile Theme Preview"
                onLoad={() => setIsThemeLoading(false)}
                className="w-full h-full border-0"
              />
            </div>

            {/* Phone Bottom Home Indicator Bar */}
            <div className="h-4 bg-slate-900 flex items-center justify-center flex-shrink-0">
              <div className="w-28 h-1 rounded-full bg-slate-700/70" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandingSettingsPage({ onBack }) {
  const { config, setDocumentTitle, updatePlatformConfig } = useAppConfig();
  const { theme, switchTheme, availableThemes } = useTheme();

  // Selected Theme state for admin customizer
  const [selectedTheme, setSelectedTheme] = useState(() => config?.active_theme || theme || 'meadow-emerald');

  useEffect(() => {
    if (config?.active_theme) {
      setSelectedTheme(config.active_theme);
    }
  }, [config?.active_theme]);

  const handleSelectTheme = (tId) => {
    setSelectedTheme(tId);
    switchTheme(tId);
  };

  // Branding inputs
  const [appName, setAppName] = useState(config?.app_name || 'Ternakmart');
  const [tagline, setTagline] = useState(config?.tagline || 'E-Commerce Peternakan & Logistik Armada');
  const [logoUrl, setLogoUrl] = useState(config?.app_logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(config?.app_favicon_url || '');
  const [timezoneOffset, setTimezoneOffset] = useState(config?.timezone_offset || 'Asia/Jakarta');

  // Upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoFileRef = useRef(null);
  const faviconFileRef = useRef(null);

  // Expedition & Rates
  const [shippingRatePerKm, setShippingRatePerKm] = useState(config?.shipping_rate_per_km || 8500);
  const [enableApiExpedition, setEnableApiExpedition] = useState(config?.enable_api_expedition ?? true);
  const [serviceFeeNominal, setServiceFeeNominal] = useState(config?.service_fee_nominal || 35000);

  // Contacts & Social Media
  const [supportWhatsapp, setSupportWhatsapp] = useState(config?.support_whatsapp || '+6281234567890');
  const [sosmedInstagram, setSosmedInstagram] = useState(config?.sosmed_instagram || 'https://instagram.com/ternakmart');
  const [sosmedFacebook, setSosmedFacebook] = useState(config?.sosmed_facebook || 'https://facebook.com/ternakmart');
  const [sosmedTiktok, setSosmedTiktok] = useState(config?.sosmed_tiktok || 'https://tiktok.com/@ternakmart');
  const [sosmedYoutube, setSosmedYoutube] = useState(config?.sosmed_youtube || 'https://youtube.com/@ternakmart');

  // Footer & Legal
  const [footerText, setFooterText] = useState(config?.footer_text || 'Platform resmi transaksi hewan ternak bersertifikat SKKH & live armada terpadu.');

  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setDocumentTitle('Pengaturan Website, Ekspedisi & Sosmed');
  }, []);

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const maxSize = type === 'favicon' ? 512 * 1024 : 2 * 1024 * 1024; // 512KB for favicon, 2MB for logo
    if (file.size > maxSize) {
      setUploadError(`Ukuran file terlalu besar. Maksimum ${type === 'favicon' ? '512 KB untuk favicon' : '2 MB untuk logo'}.`);
      return;
    }
    try {
      setUploadError('');
      if (type === 'logo') setLogoUploading(true);
      else setFaviconUploading(true);

      const res = await api.uploadFile(file);
      if (res.success && (res.data?.url || res.url)) {
        const uploadedUrl = res.data?.url || res.url;
        if (type === 'logo') setLogoUrl(uploadedUrl);
        else setFaviconUrl(uploadedUrl);
      }
    } catch (err) {
      setUploadError(err.message || `Gagal mengupload ${type === 'logo' ? 'logo' : 'favicon'}.`);
    } finally {
      if (type === 'logo') setLogoUploading(false);
      else setFaviconUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadError('');
    setSaveSuccess(false);

    try {
      await updatePlatformConfig({
        app_name: appName,
        tagline,
        app_logo_url: logoUrl,
        app_favicon_url: faviconUrl,
        active_theme: selectedTheme,
        timezone_offset: timezoneOffset,
        shipping_rate_per_km: parseFloat(shippingRatePerKm),
        enable_api_expedition: enableApiExpedition,
        service_fee_nominal: parseFloat(serviceFeeNominal),
        support_whatsapp: supportWhatsapp,
        sosmed_instagram: sosmedInstagram,
        sosmed_facebook: sosmedFacebook,
        sosmed_tiktok: sosmedTiktok,
        sosmed_youtube: sosmedYoutube,
        footer_text: footerText
      });

      setSaveSuccess(true);
      notifyAdminSuccess('Pengaturan platform & tema berhasil disimpan!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menyimpan konfigurasi.');
      setUploadError(err.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      )}

      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-theme-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-theme-text flex items-center gap-2">
              <Sliders className="w-6 h-6 text-theme-primary" />
              <span>Pengaturan Website, Ekspedisi & Sosmed</span>
            </h1>
            <p className="text-xs text-theme-muted mt-0.5">
              Sesuaikan identitas aplikasi, tarif armada per km, integrasi ekspedisi API, kontak CS, dan media sosial.
            </p>
          </div>

          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Berhasil Diperbarui!
            </div>
          )}
        </div>

        {uploadError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Identitas Website */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Identitas Website & Brand
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Aplikasi / Marketplace</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              {/* Logo Upload Widget */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Logo Aplikasi</label>
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-theme-border flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center flex-shrink-0">
                      <Image className="w-4 h-4 text-theme-muted" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={logoFileRef}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      disabled={logoUploading}
                      className="w-full py-2 px-3 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-theme-primary" />
                      {logoUploading ? 'Mengupload...' : 'Upload Logo'}
                    </button>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Atau tempel URL logo..."
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-2.5 py-1.5 text-[10px] text-theme-text placeholder:text-theme-muted/60 focus:outline-none focus:border-theme-primary"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-theme-muted mt-1">Format: PNG, JPG, SVG, WebP. Maks 2 MB</p>
              </div>

              {/* Favicon Upload Widget */}
              <div>
                <label className="font-bold text-theme-text block mb-1">Favicon Browser (ICO/PNG)</label>
                <div className="flex items-center gap-2">
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="Favicon" className="w-10 h-10 rounded-xl object-contain border border-theme-border bg-theme-bg p-1 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-4 h-4 text-theme-muted" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={faviconFileRef}
                      accept="image/png,image/x-icon,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'favicon')}
                    />
                    <button
                      type="button"
                      onClick={() => faviconFileRef.current?.click()}
                      disabled={faviconUploading}
                      className="w-full py-2 px-3 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-theme-primary" />
                      {faviconUploading ? 'Mengupload...' : 'Upload Favicon'}
                    </button>
                    <input
                      type="text"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="Atau tempel URL favicon..."
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-2.5 py-1.5 text-[10px] text-theme-text placeholder:text-theme-muted/60 focus:outline-none focus:border-theme-primary"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-theme-muted mt-1">Format: ICO, PNG, SVG. Maks 512 KB</p>
              </div>
            </div>
          </div>

          {/* Section: Tema Tampilan */}
          <div className="pt-4 border-t border-theme-border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Tema Tampilan Marketplace
            </h2>
            <p className="text-[11px] text-theme-muted">
              Pilih tema warna di bawah ini untuk diterapkan langsung ke tampilan toko dan landing page pelanggan:
            </p>

            {/* Pilihan Tema (DI ATAS Live Preview) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id)}
                  className={`relative rounded-2xl border-2 text-left transition-all overflow-hidden group cursor-pointer ${
                    selectedTheme === t.id
                      ? 'border-theme-primary ring-2 ring-theme-primary/40 shadow-lg shadow-theme-primary/20'
                      : 'border-theme-border hover:border-theme-primary/50'
                  }`}
                >
                  {/* Mini landing page mockup */}
                  <div
                    className="h-16 w-full flex flex-col p-2 gap-1"
                    style={{ background: t.preview?.[0] || t.bg || '#f8fafc' }}
                  >
                    {/* Fake nav bar */}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ background: t.preview?.[1] || t.color }}></div>
                      <div className="h-1.5 rounded-full flex-1" style={{ background: (t.preview?.[1] || t.color) + '40' }}></div>
                      <div className="h-4 w-6 rounded-md" style={{ background: t.preview?.[1] || t.color }}></div>
                    </div>
                    {/* Fake hero block */}
                    <div className="flex gap-1 flex-1 items-end">
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 rounded-full w-4/5" style={{ background: (t.preview?.[2] || '#f59e0b') + '80' }}></div>
                        <div className="h-2 rounded-full w-3/5" style={{ background: t.preview?.[1] || t.color }}></div>
                      </div>
                      <div className="w-8 h-8 rounded-lg" style={{ background: (t.preview?.[1] || t.color) + '30', border: `1px solid ${t.preview?.[1] || t.color}40` }}></div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="px-2.5 py-2 bg-theme-card border-t border-theme-border">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${selectedTheme === t.id ? 'text-theme-primary' : 'text-theme-text'}`}>
                        {t.name}
                      </span>
                      {selectedTheme === t.id && (
                        <span className="w-4 h-4 rounded-full bg-theme-primary flex items-center justify-center">
                          <span className="text-[8px] text-white font-black">✓</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-theme-muted mt-0.5 leading-tight truncate">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Live Preview Section (DI BAWAH Pilihan Tema) */}
            <div className="p-2.5 sm:p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-3 animate-in fade-in mt-4 w-full max-w-full overflow-hidden">
              <label className="font-bold text-theme-text block text-xs">Live Preview Tema Landing Page</label>
              <ThemePreview themeId={selectedTheme} availableThemes={availableThemes} />
              <p className="text-[10px] text-theme-muted">
                Pratinjau langsung tema terpilih. Klik 'Simpan Semua Pengaturan' untuk menyimpan preferensi ini secara permanen.
              </p>
            </div>
          </div>

          {/* Section 2: Biaya Ekspedisi & Layanan */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Tarif Ekspedisi & Biaya Layanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Tarif Armada per KM (Rupiah)</label>
                <input
                  type="number"
                  step="500"
                  value={shippingRatePerKm}
                  onChange={(e) => setShippingRatePerKm(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
                <span className="text-[10px] text-theme-muted mt-0.5 block">Default: Rp 8.500 / km</span>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Biaya Layanan Admin (Rupiah)</label>
                <input
                  type="number"
                  step="1000"
                  value={serviceFeeNominal}
                  onChange={(e) => setServiceFeeNominal(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
                <span className="text-[10px] text-theme-muted mt-0.5 block">Termasuk asuransi hidup</span>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Opsi Ekspedisi API Cargo</label>
                <button
                  type="button"
                  onClick={() => setEnableApiExpedition(!enableApiExpedition)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    enableApiExpedition
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-theme-bg border-theme-border text-theme-muted'
                  }`}
                >
                  {enableApiExpedition ? '✓ Aktif (Kalog / Herona API)' : '✕ Nonaktif'}
                </button>
                <span className="text-[10px] text-theme-muted mt-0.5 block">Cargo tarif terstandar</span>
              </div>
            </div>
          </div>

          {/* Section 3: Kontak CS & Media Sosial */}
          <div className="pt-4 border-t border-theme-border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> Kontak CS & Media Sosial Resmi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">WhatsApp Customer Care</label>
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Link Instagram Resmi</label>
                <input
                  type="text"
                  value={sosmedInstagram}
                  onChange={(e) => setSosmedInstagram(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Link Facebook Fanpage</label>
                <input
                  type="text"
                  value={sosmedFacebook}
                  onChange={(e) => setSosmedFacebook(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Link TikTok Resmi</label>
                <input
                  type="text"
                  value={sosmedTiktok}
                  onChange={(e) => setSosmedTiktok(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Footer Teks & Hak Cipta */}
          <div className="pt-4 border-t border-theme-border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Teks Footer & Legalitas
            </h2>
            <div>
              <label className="font-bold text-theme-text block mb-1">Deskripsi Ringkas Footer</label>
              <textarea
                rows={2}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:border-theme-primary resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
            >
              {saving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
