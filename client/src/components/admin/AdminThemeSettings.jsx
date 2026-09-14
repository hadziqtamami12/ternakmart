// AdminThemeSettings.jsx - Dynamic Theme Engine with Interactive Smartphone Live Preview
import React, { useState } from 'react';
import { 
  Palette, 
  Smartphone, 
  Check, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Sliders, 
  ShoppingBag, 
  Search, 
  Heart, 
  MapPin, 
  ShieldCheck,
  Compass,
  MessageCircle,
  ClipboardList,
  User
} from 'lucide-react';

export const THEME_PRESETS = [
  {
    id: 'meadow-emerald',
    name: 'Meadow Emerald',
    tagline: 'Hijau Agrikultur Subur',
    primary: '#15803D',
    accent: '#86EFAC',
    surface: '#F0FDF4',
    card: '#FFFFFF',
    text: '#14532D',
    border: '#BBF7D0'
  },
  {
    id: 'sunset-terracotta',
    name: 'Sunset Terracotta',
    tagline: 'Nuansa Tanah & Farm Hangat',
    primary: '#C2410C',
    accent: '#FDBA74',
    surface: '#FFF7ED',
    card: '#FFFFFF',
    text: '#7C2D12',
    border: '#FED7AA'
  },
  {
    id: 'slate-agrotech',
    name: 'Slate Agrotech',
    tagline: 'Modern Dark Industrial Tech',
    primary: '#38BDF8',
    accent: '#38BDF8',
    surface: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155'
  },
  {
    id: 'pasture-azure',
    name: 'Pasture Azure',
    tagline: 'Biru Maritim & Agribisnis',
    primary: '#0369A1',
    accent: '#7DD3FC',
    surface: '#F0F9FF',
    card: '#FFFFFF',
    text: '#0C4A6E',
    border: '#BAE6FD'
  }
];

export default function AdminThemeSettings({ onSaveTheme }) {
  const [selectedThemeId, setSelectedThemeId] = useState('meadow-emerald');
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Custom Color State
  const [customColors, setCustomColors] = useState({
    primary: '#15803D',
    accent: '#86EFAC',
    surface: '#F0FDF4'
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active theme calculation
  const activePreset = THEME_PRESETS.find(t => t.id === selectedThemeId) || THEME_PRESETS[0];
  const activeTheme = isCustomMode ? {
    id: 'custom-palette',
    name: 'Custom Palette Mode',
    primary: customColors.primary,
    accent: customColors.accent,
    surface: customColors.surface,
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0'
  } : activePreset;

  const handleApplyToApp = async () => {
    setSaving(true);
    try {
      // Apply CSS variables to root element
      document.documentElement.style.setProperty('--color-primary', activeTheme.primary);
      document.documentElement.style.setProperty('--color-accent', activeTheme.accent);
      document.documentElement.style.setProperty('--color-bg', activeTheme.surface);
      document.documentElement.setAttribute('data-theme', activeTheme.id);

      if (onSaveTheme) {
        await onSaveTheme({
          theme_id: activeTheme.id,
          is_custom: isCustomMode,
          custom_palette: isCustomMode ? customColors : null
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Dynamic Theme Engine & Live Preview</span>
          </div>
          <h2 className="text-xl font-black text-white">Manajemen Tema & Tampilan Marketplace</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Pilih palet terkurasi atau gunakan Custom Hex Picker. Pratinjau perubahan secara realtime di viewport smartphone sebelum diterapkan ke seluruh pengguna.
          </p>
        </div>

        <button
          onClick={handleApplyToApp}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-200" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saveSuccess ? 'Tema Berhasil Disimpan!' : 'Simpan & Publikasikan'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Preset Switcher & Custom Color Mode (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                Pilihan Preset Resmi
              </span>
              <span className="text-[11px] text-slate-500">4 Palet Terverifikasi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEME_PRESETS.map((preset) => {
                const isSelected = !isCustomMode && selectedThemeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedThemeId(preset.id);
                    }}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all group ${
                      isSelected
                        ? 'border-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm -ml-2"
                          style={{ backgroundColor: preset.accent }}
                        />
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm -ml-2"
                          style={{ backgroundColor: preset.surface }}
                        />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {preset.name}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Palette Mode */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Custom Palette Mode
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all ${
                  isCustomMode 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isCustomMode ? 'Mode Aktif' : 'Aktifkan Mode Custom'}
              </button>
            </div>

            {isCustomMode && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Primary Color (Hex)</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Accent Color (Hex)</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Surface / BG (Hex)</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={customColors.surface}
                      onChange={(e) => setCustomColors({ ...customColors, surface: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.surface}
                      onChange={(e) => setCustomColors({ ...customColors, surface: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Realistic Smartphone Live Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Viewport Frame Smartphone (Live)
            </span>
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="w-[340px] h-[670px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
            {/* Camera Notch / Speaker Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Inner Mobile Screen */}
            <div 
              className="w-full h-full rounded-[36px] overflow-hidden flex flex-col relative transition-colors duration-300"
              style={{ backgroundColor: activeTheme.surface, color: activeTheme.text }}
            >
              {/* Mobile Status Bar */}
              <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[10px] font-bold opacity-80 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1 text-[9px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mobile Header Bar */}
              <div 
                className="px-4 py-2 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-10"
                style={{ borderColor: activeTheme.primary + '20', backgroundColor: activeTheme.surface + 'EE' }}
              >
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    🐂
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight leading-none" style={{ color: activeTheme.primary }}>
                      TernakMart
                    </div>
                    <span className="text-[9px] opacity-70 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> Pasar Hewan Jabar
                    </span>
                  </div>
                </div>

                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shadow-sm"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Mobile Body Content (Scrollable simulation) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Search Pill */}
                <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-slate-200 shadow-sm">
                  <Search className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400">Cari Sapi Limosin, Kambing Etawa...</span>
                </div>

                {/* Hero Promotion Card */}
                <div 
                  className="p-3.5 rounded-2xl text-white relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <div className="relative z-10 space-y-1">
                    <span 
                      className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider"
                      style={{ backgroundColor: activeTheme.accent, color: activeTheme.primary }}
                    >
                      SKKH Terverifikasi
                    </span>
                    <div className="text-xs font-extrabold leading-tight">
                      Qurban Super Berkah
                    </div>
                    <p className="text-[9px] opacity-90 leading-tight">
                      Free Ongkir Armada Khusus & Garansi Bobot Timbang
                    </p>
                  </div>
                  <div className="absolute right-1 bottom-1 text-3xl opacity-20">
                    🐄
                  </div>
                </div>

                {/* Livestock Item Card Simulation */}
                <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm space-y-2">
                  <div className="h-24 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <span className="text-4xl">🐂</span>
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                      Sehat & Siap Kirim
                    </div>
                    <div className="absolute top-1.5 right-1.5 bg-white/90 p-1 rounded-full shadow-xs">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-900">Sapi Simental Super</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Bobot 480 kg
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Farm Barokah Berjaya</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <div className="text-[8px] text-slate-400 line-through">Rp 26.500.000</div>
                        <div className="text-xs font-black" style={{ color: activeTheme.primary }}>
                          Rp 24.200.000
                        </div>
                      </div>
                      <button 
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: activeTheme.primary }}
                      >
                        Beli Langsung
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Bar */}
              <div 
                className="h-14 bg-white/95 border-t border-slate-200/80 px-4 flex items-center justify-around z-20 backdrop-blur-md"
              >
                <div className="flex flex-col items-center gap-0.5" style={{ color: activeTheme.primary }}>
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-[8px] font-extrabold">Beranda</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400">
                  <Compass className="w-4 h-4" />
                  <span className="text-[8px]">Eksplor</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400 relative">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[8px]">Chat</span>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 text-[6px] text-white flex items-center justify-center font-bold">
                    3
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400">
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-[8px]">Pesanan</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-[8px]">Akun</span>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-400 rounded-full opacity-50 z-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
