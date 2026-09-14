// LocationPicker.jsx - Smart Multi-Method Location Picker for TernakMart
// Replaces manual lat/long decimal input with GPS, Google Maps / WA shareloc link resolver, and address geocoding.
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { api } from '../../utils/api';

export default function LocationPicker({
  value = {},
  onChange,
  label = 'Titik Lokasi Pengiriman / Peternakan',
  required = false
}) {
  const [activeTab, setActiveTab] = useState('gps'); // 'gps' | 'link' | 'address'
  const [mapUrlInput, setMapUrlInput] = useState('');
  const [addressInput, setAddressInput] = useState(value.address || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentLat = value.latitude;
  const currentLng = value.longitude;
  const currentAddress = value.address;

  // 1. Auto GPS Detection
  const handleDetectGPS = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Browser Anda tidak mendukung deteksi lokasi otomatis GPS. Silakan gunakan link Google Maps.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse-geocode to get friendly Indonesian address
          const res = await api.post('/auth/resolve-location', {
            latitude: lat,
            longitude: lng,
            address: addressInput
          });

          if (res.success && res.data) {
            const finalAddr = res.data.address || addressInput || 'Lokasi Terdeteksi via GPS';
            setAddressInput(finalAddr);
            if (onChange) {
              onChange({
                latitude: res.data.latitude,
                longitude: res.data.longitude,
                address: finalAddr
              });
            }
            setSuccessMsg('✅ Lokasi GPS berhasil dideteksi dengan akurasi tinggi!');
          }
        } catch (err) {
          // Fallback with coordinates
          if (onChange) {
            onChange({
              latitude: lat,
              longitude: lng,
              address: addressInput || `Koordinat GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`
            });
          }
          setSuccessMsg('✅ Koordinat GPS berhasil diamankan.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        let msg = 'Gagal mengakses GPS perangkat.';
        if (err.code === 1) {
          msg = 'Izin GPS ditolak oleh browser/perangkat. Silakan aktifkan izin lokasi atau tempel tautan Google Maps di tab sebelah.';
        } else if (err.code === 2) {
          msg = 'Sinyal GPS tidak tersedia saat ini. Silakan tempel tautan Google Maps.';
        } else if (err.code === 3) {
          msg = 'Waktu pencarian GPS habis (timeout). Coba lagi atau gunakan opsi link Google Maps.';
        }
        setErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // 2. Resolve Google Maps / WhatsApp Shareloc Link
  const handleResolveMapLink = async (e) => {
    if (e) e.preventDefault();
    if (!mapUrlInput || mapUrlInput.trim().length < 5) {
      setErrorMsg('Masukkan tautan Google Maps yang valid.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/resolve-location', {
        mapUrl: mapUrlInput.trim(),
        address: addressInput
      });

      if (res.success && res.data) {
        const finalAddr = res.data.address || addressInput || 'Lokasi dari Google Maps';
        setAddressInput(finalAddr);
        if (onChange) {
          onChange({
            latitude: res.data.latitude,
            longitude: res.data.longitude,
            address: finalAddr
          });
        }
        setSuccessMsg(`✅ Titik peta Google Maps berhasil terhubung! (${res.data.latitude.toFixed(4)}, ${res.data.longitude.toFixed(4)})`);
      } else {
        setErrorMsg(res.message || 'Tautan Google Maps tidak dapat diproses.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses tautan Google Maps.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Geocode Text Address Fallback
  const handleGeocodeAddress = async (e) => {
    if (e) e.preventDefault();
    if (!addressInput || addressInput.trim().length < 4) {
      setErrorMsg('Ketik alamat yang cukup lengkap (nama jalan, kelurahan, atau kota).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/resolve-location', {
        address: addressInput.trim()
      });

      if (res.success && res.data) {
        if (onChange) {
          onChange({
            latitude: res.data.latitude,
            longitude: res.data.longitude,
            address: res.data.address || addressInput
          });
        }
        setSuccessMsg(`✅ Alamat berhasil dikonversi ke titik peta (${res.data.latitude.toFixed(4)}, ${res.data.longitude.toFixed(4)})`);
      } else {
        setErrorMsg(res.message || 'Alamat tidak ditemukan di peta. Coba tambahkan nama kota atau gunakan link Google Maps.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengonversi alamat ke peta.');
    } finally {
      setLoading(false);
    }
  };

  const hasCoordinates = currentLat !== undefined && currentLng !== undefined && currentLat !== null && currentLng !== null;

  return (
    <div className="space-y-3 bg-theme-bg/60 border border-theme-border rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-theme-text flex items-center gap-2">
          <MapPin className="w-4 h-4 text-theme-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {hasCoordinates && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Titik Terpasang
          </span>
        )}
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-theme-card border border-theme-border rounded-xl">
        <button
          type="button"
          onClick={() => { setActiveTab('gps'); setErrorMsg(''); }}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'gps'
              ? 'bg-theme-primary text-white shadow-sm'
              : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>GPS Otomatis</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('link'); setErrorMsg(''); }}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'link'
              ? 'bg-theme-primary text-white shadow-sm'
              : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Google Maps</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('address'); setErrorMsg(''); }}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'address'
              ? 'bg-theme-primary text-white shadow-sm'
              : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Cari Alamat</span>
        </button>
      </div>

      {/* Tab 1: GPS Auto Detect */}
      {activeTab === 'gps' && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-theme-muted leading-relaxed">
            Klik tombol di bawah untuk mendeteksi koordinat lokasi terkini perangkat Anda secara otomatis menggunakan GPS.
          </p>
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mendeteksi Sinyal GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Nyalakan & Ambil Lokasi GPS</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 2: Google Maps / WA Shareloc Link */}
      {activeTab === 'link' && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-theme-muted leading-relaxed">
            Tempel tautan Google Maps kandang/rumah Anda (misal: <code className="bg-theme-card px-1 py-0.5 rounded text-[10px]">https://maps.app.goo.gl/...</code> atau tautan shareloc WhatsApp).
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/xxxx"
              value={mapUrlInput}
              onChange={(e) => setMapUrlInput(e.target.value)}
              className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
            <button
              type="button"
              onClick={handleResolveMapLink}
              disabled={loading || !mapUrlInput}
              className="px-3 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 transition-all"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Terapkan</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Text Address to Map */}
      {activeTab === 'address' && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-theme-muted leading-relaxed">
            Ketik alamat jalan atau nama wilayah domisili untuk diconvert menjadi titik peta koordinat armada.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Jl. Margonda Raya No. 100, Beji, Depok"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
            <button
              type="button"
              onClick={handleGeocodeAddress}
              disabled={loading || !addressInput}
              className="px-3 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 transition-all"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Convert</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{successMsg}</span>
        </div>
      )}

      {/* Current Location Badge & Gmaps Link Preview */}
      {hasCoordinates && (
        <div className="pt-2 border-t border-theme-border/60 flex items-center justify-between text-[11px] text-theme-muted">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-theme-text truncate">
              {currentAddress || `Titik: ${Number(currentLat).toFixed(4)}, ${Number(currentLng).toFixed(4)}`}
            </span>
          </div>

          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-theme-primary hover:underline font-bold flex-shrink-0 ml-2 text-[10px]"
          >
            <span>Buka Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
