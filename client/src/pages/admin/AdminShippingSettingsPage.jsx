// AdminShippingSettingsPage.jsx - GoTernak Internal Courier & 3rd-Party Expedition Settings
import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  Building2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  Globe,
  DollarSign,
  Calculator,
  Save,
  PackageCheck
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah } from '../../utils/formatters';

const DEFAULT_COURIERS = [
  'JNE Trucking (JTR)',
  'SiCepat Gokil',
  'Kalog Express',
  'Herona Express'
];

export default function AdminShippingSettingsPage() {
  const [settings, setSettings] = useState({
    is_goternak_active: true,
    goternak_base_fee: 20000,
    goternak_per_km_fee: 4000,
    goternak_min_distance_km: 2,
    is_third_party_active: true,
    expedition_provider: 'Biteship Multi-Courier / Custom Cargo',
    third_party_api_key: '',
    third_party_base_url: 'https://api.biteship.com/v1',
    is_sandbox: true,
    active_couriers: DEFAULT_COURIERS
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Simulator state
  const [simKm, setSimKm] = useState(15);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipping-settings');
      if (res.success && res.data) {
        let couriers = res.data.active_couriers;
        if (typeof couriers === 'string') {
          try { couriers = JSON.parse(couriers); } catch (e) { couriers = DEFAULT_COURIERS; }
        }
        setSettings({
          ...res.data,
          active_couriers: Array.isArray(couriers) ? couriers : DEFAULT_COURIERS
        });
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat pengaturan pengiriman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...settings,
        goternak_base_fee: parseFloat(settings.goternak_base_fee) || 0,
        goternak_per_km_fee: parseFloat(settings.goternak_per_km_fee) || 0,
        goternak_min_distance_km: parseFloat(settings.goternak_min_distance_km) || 0
      };
      const res = await api.put('/shipping-settings', payload);
      if (res.success) {
        setSuccessMsg('Pengaturan pengiriman dan ekspedisi berhasil diperbarui.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCourier = (courierName) => {
    setSettings((prev) => {
      const current = prev.active_couriers || [];
      if (current.includes(courierName)) {
        return { ...prev, active_couriers: current.filter((c) => c !== courierName) };
      } else {
        return { ...prev, active_couriers: [...current, courierName] };
      }
    });
  };

  // Kalkulasi simulasi GoTernak
  const simulatedGoternakFee = (settings.is_goternak_active)
    ? (parseFloat(settings.goternak_base_fee) || 0) + ((parseFloat(settings.goternak_per_km_fee) || 0) * simKm)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Pengaturan Logistik & Pengiriman</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi armada internal GoTernak (formula jarak tikor) & integrasi API ekspedisi pihak ketiga.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: GOTERNAK SETTINGS */}
        <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-theme-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-theme-text">GoTernak (Armada Mandiri Khusus Hewan)</h2>
                <p className="text-xs text-theme-muted">Kurir internal berbasis kalkulasi Haversine jarak titik koordinat (Tikor).</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_goternak_active}
                onChange={(e) => setSettings({ ...settings, is_goternak_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-xs font-bold text-theme-muted">
                {settings.is_goternak_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block">Tarif Dasar / Base Fee (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-theme-muted font-bold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={settings.goternak_base_fee}
                  onChange={(e) => setSettings({ ...settings, goternak_base_fee: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>
              <p className="text-[10px] text-theme-muted">Biaya dasar minimum armada penjemputan ternak.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block">Tarif per Kilometer (Rp/km)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-theme-muted font-bold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={settings.goternak_per_km_fee}
                  onChange={(e) => setSettings({ ...settings, goternak_per_km_fee: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>
              <p className="text-[10px] text-theme-muted">Dikalikan jarak lurus formula Tikor kandang & penerima.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block">Jarak Minimal (KM)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={settings.goternak_min_distance_km}
                onChange={(e) => setSettings({ ...settings, goternak_min_distance_km: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
              <p className="text-[10px] text-theme-muted">Radius terpendek untuk pemesanan armada GoTernak.</p>
            </div>
          </div>

          {/* Live GoTernak Calculation Simulator */}
          <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-500">
                <Calculator className="w-4 h-4" />
                <span>Simulasi Kalkulasi Ongkir GoTernak Real-Time</span>
              </div>
              <span className="text-xs font-bold text-theme-text bg-theme-card border border-theme-border px-2.5 py-0.5 rounded-lg">
                Jarak: {simKm} KM
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={simKm}
              onChange={(e) => setSimKm(parseInt(e.target.value) || 1)}
              className="w-full h-1.5 bg-theme-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-theme-muted">
                Formula: {formatRupiah(settings.goternak_base_fee)} + ({formatRupiah(settings.goternak_per_km_fee)} × {simKm} km)
              </span>
              <span className="text-sm font-black text-emerald-500">
                Total Estimasi: {formatRupiah(simulatedGoternakFee)}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: 3RD PARTY EXPEDITION SETTINGS */}
        <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-theme-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-theme-text">Ekspedisi Kargo Logistik (API Pihak Ketiga)</h2>
                <p className="text-xs text-theme-muted">Untuk produk pakan, suplemen, obat, atau mitra kargo resmi.</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_third_party_active}
                onChange={(e) => setSettings({ ...settings, is_third_party_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ml-3 text-xs font-bold text-theme-muted">
                {settings.is_third_party_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block">Penyedia Layanan API / Provider</label>
              <input
                type="text"
                value={settings.expedition_provider}
                onChange={(e) => setSettings({ ...settings, expedition_provider: e.target.value })}
                placeholder="Contoh: Biteship / RajaOngkir Pro"
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block">Mode Eksekusi API</label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-theme-text">
                  <input
                    type="radio"
                    name="mode"
                    checked={settings.is_sandbox === true}
                    onChange={() => setSettings({ ...settings, is_sandbox: true })}
                    className="accent-blue-500"
                  />
                  <span>Sandbox (Testing / Dummy Rates)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-theme-text">
                  <input
                    type="radio"
                    name="mode"
                    checked={settings.is_sandbox === false}
                    onChange={() => setSettings({ ...settings, is_sandbox: false })}
                    className="accent-emerald-500"
                  />
                  <span>Production (Live Rate API)</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-500" />
                <span>API Secret Key</span>
              </label>
              <input
                type="password"
                value={settings.third_party_api_key || ''}
                onChange={(e) => setSettings({ ...settings, third_party_api_key: e.target.value })}
                placeholder="sk_test_..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-semibold block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Base Endpoint URL</span>
              </label>
              <input
                type="text"
                value={settings.third_party_base_url || ''}
                onChange={(e) => setSettings({ ...settings, third_party_base_url: e.target.value })}
                placeholder="https://api.biteship.com/v1"
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Active Couriers Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-theme-border">
            <label className="text-xs font-semibold text-theme-text block">
              Pilihan Kurir Kargo yang Aktif di Checkout:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEFAULT_COURIERS.map((courier) => {
                const isActive = (settings.active_couriers || []).includes(courier);
                return (
                  <div
                    key={courier}
                    onClick={() => toggleCourier(courier)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 text-xs ${
                      isActive
                        ? 'border-theme-primary bg-theme-primary/10 text-theme-primary font-bold'
                        : 'border-theme-border bg-theme-bg text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      isActive ? 'bg-theme-primary border-theme-primary text-theme-primary-contrast' : 'border-theme-border'
                    }`}>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{courier}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-theme-primary hover:brightness-110 disabled:opacity-50 text-theme-primary-contrast font-bold rounded-2xl transition flex items-center gap-2 shadow-lg text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan Logistik'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
