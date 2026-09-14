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
  Search
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAppConfig } from '../../context/AppConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';

/* ─── Realistic Landing Page Theme Preview (Desktop & Mobile) ─── */
function ThemePreview({ themeId, availableThemes }) {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const t = availableThemes.find(x => x.id === themeId) || availableThemes[0];
  const bg = t.preview?.[0] || t.bg || '#F0FDF4';
  const primary = t.preview?.[1] || t.color || '#15803D';
  const accent = t.preview?.[2] || '#86EFAC';

  return (
    <div className="space-y-3">
      {/* Switcher Controls: Desktop vs Mobile */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-400">Mode Pratinjau Tampilan:</span>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'desktop'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (16:9)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (375px)</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center w-full overflow-hidden bg-slate-950/80 rounded-2xl p-2 sm:p-4 border border-slate-800">
        {viewMode === 'desktop' ? (
          /* DESKTOP MOCKUP */
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl transition-all"
            style={{ background: bg }}
          >
            {/* Browser Header Bar */}
            <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-xs mx-auto bg-slate-950/80 text-[10px] text-slate-400 rounded-md px-2 py-0.5 text-center font-mono truncate">
                https://ternakmart.id
              </div>
            </div>

            {/* Desktop Navbar (Adaptive) */}
            <div className="px-5 py-3 border-b border-black/5 flex items-center justify-between backdrop-blur-md bg-white/70">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: primary }}>
                    🐂
                  </div>
                  <span className="font-black text-sm tracking-tight" style={{ color: primary }}>
                    TernakMart
                  </span>
                </div>
                {/* Search box */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 bg-white/80 text-slate-400 text-[11px] w-64">
                  <Search className="w-3.5 h-3.5" />
                  <span className="truncate">Cari sapi limosin, domba Garut...</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span style={{ color: primary }}>Katalog</span>
                <span className="text-slate-600">Buka Toko</span>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] shadow-sm relative" style={{ background: primary }}>
                  🛒
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center font-black">2</span>
                </div>
              </div>
            </div>

            {/* Desktop Hero Section - 100% Faithful to HomePage */}
            <div className="relative h-72 sm:h-80 overflow-hidden flex items-center px-6 sm:px-10 text-white select-none">
              <img
                src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&auto=format&fit=crop&q=85"
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover -z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/75 -z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent -z-10" />

              <div className="max-w-xl space-y-3.5">
                {/* Real Badge row from HomePage */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    FESTIVAL AKBAR QURBAN 1447H
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    🐂 SAPI & DOMBA SUPER
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-wider backdrop-blur-md">
                    Kupon: QURBANBERKAH
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-[1.15] drop-shadow-md">
                  Diskon Spesial Ternak Hingga Rp 1.500.000
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg line-clamp-2 drop-shadow">
                  Pesan hewan qurban bersertifikat sehat SKKH resmi. Gratis biaya perawatan & pakan sampai Hari Raya Idul Adha 1447H.
                </p>

                {/* Dual CTA buttons matching HomePage */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    className="px-5 py-2.5 rounded-2xl text-slate-950 font-black text-xs flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
                    style={{ background: primary }}
                  >
                    <span>Beli Ternak Qurban</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs backdrop-blur-md shadow-md flex items-center gap-2">
                    <span>Jelajahi Semua Hewan</span>
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <div className="h-2 w-7 rounded-full shadow-sm" style={{ background: primary }} />
                <div className="h-2 w-2 rounded-full bg-white/40" />
                <div className="h-2 w-2 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Category Quick Row */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm tracking-tight" style={{ color: primary }}>Kategori Unggulan</h3>
                  <p className="text-[10px] text-slate-500">Pilihan ternak qurban & bibit unggul siap kirim</p>
                </div>
                <span className="text-xs font-bold cursor-pointer" style={{ color: primary }}>Lihat Semua →</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Sapi Simental & Limosin', count: '142 Ekor', icon: '🐂' },
                  { name: 'Domba Garut & Merino', count: '310 Ekor', icon: '🐑' },
                  { name: 'Kambing Etawa & Boer', count: '198 Ekor', icon: '🐐' },
                  { name: 'Paket Qurban & Aqiqah', count: 'Siap Potong', icon: '🍲' }
                ].map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 bg-white/80 shadow-sm hover:shadow-md"
                    style={{ borderColor: primary + '25' }}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="font-extrabold text-[11px] truncate w-full text-slate-800">{c.name}</span>
                    <span className="text-[9px] font-bold" style={{ color: primary }}>{c.count}</span>
                  </div>
                ))}
              </div>

              {/* Sample Product Cards Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  {
                    title: 'Sapi Simental Bobot 540kg',
                    store: 'Barokah Farm · Bogor',
                    price: 'Rp 27.500.000',
                    img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400'
                  },
                  {
                    title: 'Domba Garut Tanduk Mewah',
                    store: 'Kandang Garut Prima · Garut',
                    price: 'Rp 6.800.000',
                    img: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=400'
                  },
                  {
                    title: 'Kambing Etawa Super Susu',
                    store: 'Peternakan Jaya · Sukabumi',
                    price: 'Rp 4.500.000',
                    img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border bg-white/90 shadow-sm flex flex-col justify-between"
                    style={{ borderColor: primary + '20' }}
                  >
                    <div className="relative h-28 w-full overflow-hidden">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shadow-sm">
                        SKKH Aktif
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-extrabold text-xs truncate text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.store}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-xs" style={{ color: primary }}>{item.price}</span>
                        <button className="px-2 py-1 rounded-lg text-white text-[10px] font-bold" style={{ background: primary }}>
                          + Beli
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MOBILE MOCKUP (Smartphone Frame) */
          <div
            className="w-[360px] rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl relative"
            style={{ background: bg }}
          >
            {/* Phone Notch */}
            <div className="h-5 bg-slate-900 flex items-center justify-center relative">
              <div className="w-24 h-3 bg-black rounded-b-xl flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Mobile Topbar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: primary }}>
                  🐂
                </div>
                <span className="font-black text-xs" style={{ color: primary }}>TernakMart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
                  <Search className="w-3 h-3" />
                </div>
                <div className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-[10px] relative" style={{ background: primary }}>
                  🛒
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 text-white text-[7px] flex items-center justify-center font-black">2</span>
                </div>
              </div>
            </div>

            {/* Mobile Hero - Matching HomePage Mobile */}
            <div className="relative h-56 overflow-hidden flex items-end p-4 text-white select-none">
              <img
                src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=85"
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover -z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/75 -z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent -z-10" />

              <div className="space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[8px] font-black uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    FESTIVAL QURBAN 1447H
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-white/15 border border-white/20 text-white">
                    🐂 SAPI & DOMBA
                  </span>
                </div>
                <h2 className="text-sm font-black leading-tight text-white drop-shadow">
                  Diskon Spesial Ternak Hingga Rp 1.500.000
                </h2>
                <p className="text-[10px] text-slate-200 line-clamp-1">
                  Pesan hewan qurban bersertifikat SKKH resmi gratis rawat pakan.
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-950 shadow-md flex items-center gap-1"
                    style={{ background: primary }}
                  >
                    <span>Beli Qurban</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-white bg-white/20 backdrop-blur-md">
                    Jelajahi
                  </button>
                </div>
              </div>

              {/* Mobile slider dots */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                <div className="h-1.5 w-4 rounded-full" style={{ background: primary }} />
                <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Mobile Categories Scroll */}
            <div className="p-3 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: primary }}>
                Kategori Hewan
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { name: 'Sapi', icon: '🐂' },
                  { name: 'Domba', icon: '🐑' },
                  { name: 'Kambing', icon: '🐐' },
                  { name: 'Aqiqah', icon: '🍲' }
                ].map((cat, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-center min-w-[65px] bg-white/90 border shadow-xs"
                    style={{ borderColor: primary + '30' }}
                  >
                    <span className="text-base block">{cat.icon}</span>
                    <span className="text-[9px] font-bold text-slate-800">{cat.name}</span>
                  </div>
                ))}
              </div>

              {/* Mobile 2-Column Catalog Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  {
                    title: 'Simental 540kg',
                    price: 'Rp 27.5 Jt',
                    img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=240'
                  },
                  {
                    title: 'Domba Garut Super',
                    price: 'Rp 6.8 Jt',
                    img: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=240'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border bg-white/95 shadow-xs"
                    style={{ borderColor: primary + '20' }}
                  >
                    <img src={item.img} alt={item.title} className="w-full h-20 object-cover" />
                    <div className="p-2 space-y-0.5">
                      <p className="font-bold text-[10px] truncate text-slate-800">{item.title}</p>
                      <p className="font-black text-[11px]" style={{ color: primary }}>{item.price}</p>
                      <button className="w-full py-1 rounded-md text-[9px] font-bold text-white mt-1" style={{ background: primary }}>
                        + Keranjang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Bottom Dock */}
            <div className="px-4 py-2 border-t border-black/5 bg-white/95 flex items-center justify-between text-center">
              <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                <span className="text-xs" style={{ color: primary }}>🏠</span>
                <span className="text-[8px] font-bold" style={{ color: primary }}>Beranda</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer text-slate-400">
                <span className="text-xs">📋</span>
                <span className="text-[8px] font-medium">Katalog</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer text-slate-400">
                <span className="text-xs">📦</span>
                <span className="text-[8px] font-medium">Pesanan</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer text-slate-400">
                <span className="text-xs">👤</span>
                <span className="text-[8px] font-medium">Akun</span>
              </div>
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
                  onClick={() => switchTheme(t.id)}
                  className={`relative rounded-2xl border-2 text-left transition-all overflow-hidden group cursor-pointer ${
                    theme === t.id
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
                      <span className={`text-[11px] font-bold ${theme === t.id ? 'text-theme-primary' : 'text-theme-text'}`}>
                        {t.name}
                      </span>
                      {theme === t.id && (
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
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-3 animate-in fade-in mt-4">
              <label className="font-bold text-theme-text block text-xs">Live Preview Tema Landing Page</label>
              <ThemePreview themeId={theme} availableThemes={availableThemes} />
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
