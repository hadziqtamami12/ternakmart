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
  ShieldCheck
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAppConfig } from '../../context/AppConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';

/* ─── Theme Preview Component ─── */
function ThemePreview({ themeId, availableThemes }) {
  const t = availableThemes.find(x => x.id === themeId) || availableThemes[0];
  const bg = t.preview?.[0] || t.bg || '#f8fafc';
  const primary = t.preview?.[1] || t.color || '#059669';
  const accent = t.preview?.[2] || '#f59e0b';

  return (
    <div 
      className="rounded-xl overflow-hidden border border-slate-700"
      style={{ background: bg }}
    >
      <div className="p-3 space-y-3" style={{ color: primary }}>
        {/* Fake Nav Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-white" style={{ background: primary }}>🐂</div>
            <span className="font-black">Ternakmart</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/80">Katalog</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/80">Masuk</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ background: primary }}>🛒</div>
          </div>
        </div>

        {/* Hero Section Mockup */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white" style={{ background: primary }}>
              {t.preview?.[2] ? 'PROMO' : 'PROMO'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white/80" style={{ background: accent }}>Kupon: QURBANBERKAH</span>
          </div>
          <h1 className="font-black leading-tight text-lg sm:text-xl" style={{ color: primary }}>
            Diskon Spesial Ternak Hingga Rp 1.500.000
          </h1>
          <p className="text-[11px] leading-relaxed" style={{ color: primary }}>
            Free Titip Rawat & Pakan Konsentrat sampai H-3 Idul Adha. Bebas Ongkir Armada Khusus Jabodetabek & Bandung.
          </p>
          <button className="mt-2 px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5" style={{ background: primary }}>
            <span>Beli Ternak Qurban</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Category Row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { icon: '🐂', label: 'Sapi Qurban' },
            { icon: '🐑', label: 'Domba Garut' },
            { icon: '🐐', label: 'Kambing Etawa' },
            { icon: '🍲', label: 'Paket Aqiqah' },
          ].map((cat, i) => (
            <div key={i} className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-center min-w-[80px]" style={{ background: primary + '15', border: `1px solid ${primary}40` }}>
              <div className="text-xl mb-0.5">{cat.icon}</div>
              <span className="text-[9px] font-bold" style={{ color: primary }}>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Flash Sale Card Mockup */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="flex-shrink-0 w-40 rounded-lg overflow-hidden border" style={{ borderColor: primary + '40', background: 'rgba(255,255,255,0.8)' }}>
            <div className="h-16 flex items-center justify-center" style={{ background: primary + '10' }}>
              <span className="text-2xl">🐂</span>
            </div>
            <div className="p-2 space-y-1">
              <span className="text-[9px] font-bold truncate block" style={{ color: primary }}>Simental Super 480kg</span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] line-through" style={{ color: primary }}>Rp 25.000.000</span>
                <span className="text-[10px] font-black" style={{ color: '#e11d48' }}>Rp 22.500.000</span>
                <span className="px-1 py-0.5 rounded text-[7px] font-black text-white" style={{ background: '#e11d48' }}>HEMAT 10%</span>
              </div>
              <button className="w-full py-1.5 rounded text-[9px] font-bold text-white mt-1" style={{ background: primary }}>
                + Keranjang
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-40 rounded-lg overflow-hidden border" style={{ borderColor: primary + '40', background: 'rgba(255,255,255,0.8)' }}>
            <div className="h-16 flex items-center justify-center" style={{ background: primary + '10' }}>
              <span className="text-2xl">🐑</span>
            </div>
            <div className="p-2 space-y-1">
              <span className="text-[9px] font-bold truncate block" style={{ color: primary }}>Domba Garut 120kg</span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] line-through" style={{ color: primary }}>Rp 15.000.000</span>
                <span className="text-[10px] font-black" style={{ color: '#e11d48' }}>Rp 13.500.000</span>
                <span className="px-1 py-0.5 rounded text-[7px] font-black text-white" style={{ background: '#e11d48' }}>HEMAT 10%</span>
              </div>
              <button className="w-full py-1.5 rounded text-[9px] font-bold text-white mt-1" style={{ background: primary }}>
                + Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Stars */}
        <div className="pt-2 border-t flex items-center gap-1" style={{ borderColor: primary + '40', color: primary }}>
          <span className="text-[10px] font-bold">Rating:</span>
          <div className="flex text-amber-400">
            {'★★★★★'}
          </div>
          <span className="text-[10px]">5.0/5.0</span>
        </div>
      </div>
    </div>
  );
}

export default function BrandingSettingsPage({ onBack }) {
  const { config, setDocumentTitle, updatePlatformConfig } = useAppConfig();
  const { theme, switchTheme, availableThemes } = useTheme();

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
        active_theme: theme,
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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
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

      <div className="bg-[#0d1421] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-emerald-400" />
              <span>Pengaturan Website, Ekspedisi & Sosmed</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan identitas aplikasi, tarif armada per km, integrasi ekspedisi API, kontak CS, dan media sosial.
            </p>
          </div>

          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Berhasil Diperbarui!
            </div>
          )}
        </div>

        {uploadError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Identitas Website */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Identitas Website & Brand
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nama Aplikasi / Marketplace</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Logo Upload Widget */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Logo Aplikasi</label>
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      <Image className="w-4 h-4 text-slate-500" />
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
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {logoUploading ? 'Mengupload...' : 'Upload Logo'}
                    </button>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Atau tempel URL logo..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Format: PNG, JPG, SVG, WebP. Maks 2 MB</p>
              </div>

              {/* Favicon Upload Widget */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Favicon Browser (ICO/PNG)</label>
                <div className="flex items-center gap-2">
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="Favicon" className="w-10 h-10 rounded-xl object-contain border border-slate-700 bg-slate-800 p-1 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-4 h-4 text-slate-500" />
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
                      className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 text-blue-400 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {faviconUploading ? 'Mengupload...' : 'Upload Favicon'}
                    </button>
                    <input
                      type="text"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="Atau tempel URL favicon..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Format: ICO, PNG, SVG. Maks 512 KB</p>
              </div>
            </div>
          </div>

          {/* Section: Tema Tampilan */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Tema Tampilan Marketplace
            </h2>
            <p className="text-[11px] text-slate-400">Pilih tema warna untuk tampilan toko / landing page pelanggan. Admin tetap menggunakan dark slate.</p>
            
            {/* Live Preview Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
              <label className="font-bold text-slate-300 block text-xs">Live Preview Tema Landing Page</label>
              <ThemePreview themeId={theme} availableThemes={availableThemes} />
              <p className="text-[10px] text-slate-500">Pratinjau langsung tema yang dipilih. Klik 'Simpan Semua Pengaturan' untuk menerapkan ke landing page.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTheme(t.id)}
                  className={`relative rounded-2xl border-2 text-left transition-all overflow-hidden group ${
                    theme === t.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-700 hover:border-slate-500'
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
                  <div className="px-2.5 py-2 bg-slate-900/90">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${theme === t.id ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {t.name}
                      </span>
                      {theme === t.id && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-[8px] text-white font-black">✓</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">Tema yang dipilih tersimpan saat klik "Simpan Semua Pengaturan". Admin selalu dark slate.</p>
          </div>

          {/* Section 2: Biaya Ekspedisi & Layanan */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Tarif Ekspedisi & Biaya Layanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Tarif Armada per KM (Rupiah)</label>
                <input
                  type="number"
                  step="500"
                  value={shippingRatePerKm}
                  onChange={(e) => setShippingRatePerKm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Default: Rp 8.500 / km</span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Biaya Layanan Admin (Rupiah)</label>
                <input
                  type="number"
                  step="1000"
                  value={serviceFeeNominal}
                  onChange={(e) => setServiceFeeNominal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Termasuk asuransi hidup</span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Opsi Ekspedisi API Cargo</label>
                <button
                  type="button"
                  onClick={() => setEnableApiExpedition(!enableApiExpedition)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    enableApiExpedition
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {enableApiExpedition ? '✓ Aktif (Kalog / Herona API)' : '✕ Nonaktif'}
                </button>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Cargo tarif terstandar</span>
              </div>
            </div>
          </div>

          {/* Section 3: Kontak CS & Media Sosial */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> Kontak CS & Media Sosial Resmi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">WhatsApp Customer Care</label>
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Link Instagram Resmi</label>
                <input
                  type="text"
                  value={sosmedInstagram}
                  onChange={(e) => setSosmedInstagram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Link Facebook Fanpage</label>
                <input
                  type="text"
                  value={sosmedFacebook}
                  onChange={(e) => setSosmedFacebook(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Link TikTok Resmi</label>
                <input
                  type="text"
                  value={sosmedTiktok}
                  onChange={(e) => setSosmedTiktok(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Footer Teks & Hak Cipta */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Teks Footer & Legalitas
            </h2>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Deskripsi Ringkas Footer</label>
              <textarea
                rows={2}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              {saving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
