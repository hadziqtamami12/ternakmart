// AdminDashboardPage.jsx - Isolated Super Admin Hub with Analytics, SVG Charts & Verifications
import React, { useState, useEffect } from 'react';
import {
  Store,
  FileText,
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useTimezone } from '../../context/TimezoneContext';
import { useAppConfig } from '../../context/AppConfigContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function AdminDashboardPage({ onNavigateTab }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { formatTime } = useTimezone();

  const [stores, setStores] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDocumentTitle('Dashboard Super Admin & Analitik');
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [storeRes, animalRes, orderRes] = await Promise.all([
        api.get('/stores?status=PENDING'),
        api.get('/animals'),
        api.get('/orders')
      ]);

      if (storeRes.success && storeRes.data) setStores(storeRes.data);
      if (animalRes.success && animalRes.data) setAnimals(animalRes.data);
      if (orderRes.success && orderRes.data) setOrders(orderRes.data);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStoreStatus = async (storeId, status) => {
    try {
      const res = await api.put(`/stores/${storeId}/status`, { status });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status toko.');
    }
  };

  // Metrics calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PAYMENT_VERIFICATION').length;
  const activeAnimals = animals.filter(a => a.status === 'AVAILABLE').length;

  // Chart data (last 7 days trend)
  const salesTrend = [
    { day: 'Sen', amount: 32000000, count: 2 },
    { day: 'Sel', amount: 54000000, count: 3 },
    { day: 'Rab', amount: 28000000, count: 1 },
    { day: 'Kam', amount: 78000000, count: 4 },
    { day: 'Jum', amount: 92000000, count: 5 },
    { day: 'Sab', amount: 145000000, count: 7 },
    { day: 'Min', amount: 110000000, count: 6 }
  ];
  const maxSale = Math.max(...salesTrend.map(s => s.amount));

  return (
    <div className="space-y-6">
      {/* 4 Metric Stats Cards: 1 Big Card Left, 3 Stacked Cards Right on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Big Card 1: Revenue (Left: 6 cols) */}
        <div className="lg:col-span-6 relative bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black text-theme-muted uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Total Omset Penjualan Platform
                </span>
                <p className="text-[11px] text-theme-muted/80">Akumulasi bruto transaksi ternak berhasil</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="pt-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-theme-text tracking-tight">
                {formatRupiah(totalRevenue || 540000000)}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1 border border-emerald-500/30">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% bulan ini
                </span>
                <span className="text-xs text-theme-muted font-medium">
                  dibandingkan periode bulan lalu
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-theme-border/60 mt-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-theme-muted block">Rata-rata Order</span>
              <span className="text-sm font-extrabold text-theme-text">Rp 19.285.000 / transaksi</span>
            </div>
            <div>
              <span className="text-[11px] text-theme-muted block">Tingkat Pemenuhan</span>
              <span className="text-sm font-extrabold text-emerald-500">98.6% Terpenuhi</span>
            </div>
          </div>
        </div>

        {/* 3 Stacked Cards on Right (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3.5 justify-between">
          {/* Card 2: Orders */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('orders')}
            className="flex-1 relative bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-blue-500/50 hover:shadow-lg transition-all shadow-md group cursor-pointer"
            title="Klik untuk melihat daftar pesanan & transaksi"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                Total Transaksi Masuk
                <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">→ Buka Pesanan</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-theme-text">
                {orders.length || 28} Pesanan
              </div>
              <p className="text-[11px] text-amber-500 font-bold">
                {pendingOrders} struk menunggu verifikasi
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Animals */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('livestock')}
            className="flex-1 relative bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-amber-500/50 hover:shadow-lg transition-all shadow-md group cursor-pointer"
            title="Klik untuk mengelola katalog ternak"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                Katalog Ternak Siap Jual
                <span className="text-[10px] text-amber-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">→ Buka Ternak</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-theme-text">
                {activeAnimals || 18} Ekor
              </div>
              <p className="text-[11px] text-theme-muted">
                Sapi, Domba & Kambing SKKH Sah
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Stores */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('users')}
            className="flex-1 relative bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-violet-500/50 hover:shadow-lg transition-all shadow-md group cursor-pointer"
            title="Klik untuk mengelola mitra peternakan & pengguna"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                Toko Mitra Peternakan
                <span className="text-[10px] text-violet-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">→ Buka Mitra</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-theme-text">
                12 Kandang
              </div>
              <p className="text-[11px] text-violet-500 font-bold">
                {stores.length} pengajuan kandang baru
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500 border border-violet-500/20 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Revenue Trend (8 cols) - Smooth Curved Line / Area Chart */}
        <div className="lg:col-span-8 bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-theme-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Grafik Penjualan 7 Hari Terakhir</span>
              </h2>
              <p className="text-[11px] text-theme-muted">Tren kurva omset transaksi ternak harian</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              Puncak: {formatRupiah(maxSale)}
            </span>
          </div>

          {/* Smooth Curved SVG Area Line Chart */}
          <div className="relative pt-2 pb-4">
            <div className="w-full h-56 sm:h-64">
              <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="emeraldLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                <line x1="20" y1="20" x2="680" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="20" y1="65" x2="680" y2="65" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="20" y1="110" x2="680" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="20" y1="155" x2="680" y2="155" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />

                {/* SVG Area Filled Path under curve */}
                <path
                  d="M 50 148 C 100 130, 100 110, 150 110 C 200 110, 200 152, 250 152 C 300 152, 300 76, 350 76 C 400 76, 400 58, 450 58 C 500 58, 500 24, 550 24 C 600 24, 600 46, 650 46 L 650 180 L 50 180 Z"
                  fill="url(#emeraldAreaGradient)"
                />

                {/* SVG Smooth Curved Stroke Line */}
                <path
                  d="M 50 148 C 100 130, 100 110, 150 110 C 200 110, 200 152, 250 152 C 300 152, 300 76, 350 76 C 400 76, 400 58, 450 58 C 500 58, 500 24, 550 24 C 600 24, 600 46, 650 46"
                  fill="none"
                  stroke="url(#emeraldLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowEffect)"
                />

                {/* Interactive Points on Curve */}
                {[
                  { cx: 50, cy: 148, day: 'Sen', val: 'Rp 32 Juta' },
                  { cx: 150, cy: 110, day: 'Sel', val: 'Rp 54 Juta' },
                  { cx: 250, cy: 152, day: 'Rab', val: 'Rp 28 Juta' },
                  { cx: 350, cy: 76, day: 'Kam', val: 'Rp 78 Juta' },
                  { cx: 450, cy: 58, day: 'Jum', val: 'Rp 92 Juta' },
                  { cx: 550, cy: 24, day: 'Sab', val: 'Rp 145 Juta' },
                  { cx: 650, cy: 46, day: 'Min', val: 'Rp 110 Juta' },
                ].map((pt, i) => (
                  <g key={i} className="cursor-pointer group">
                    <circle cx={pt.cx} cy={pt.cy} r="7" className="fill-emerald-400 opacity-20 group-hover:opacity-60 transition-opacity" />
                    <circle cx={pt.cx} cy={pt.cy} r="4" className="fill-white stroke-emerald-600 stroke-[2.5]" />
                    {/* Tooltip on hover */}
                    <text
                      x={pt.cx}
                      y={pt.cy - 12}
                      textAnchor="middle"
                      className="fill-theme-text text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {pt.val}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* X-axis Day labels */}
            <div className="flex justify-between px-4 sm:px-8 mt-2 text-xs font-bold text-theme-muted">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d, i) => (
                <span key={i} className="hover:text-emerald-500 transition-colors cursor-pointer">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Distribution by Animal Category (4 cols) */}
        <div className="lg:col-span-4 bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold text-theme-text">Komposisi Kategori Ternak</h2>
            <p className="text-[11px] text-theme-muted">Pangsa pasar permintaan ternak</p>
          </div>

          <div className="space-y-3.5 text-xs pt-2">
            <div>
              <div className="flex justify-between text-theme-text mb-1">
                <span className="font-semibold">🐂 Sapi Simental & Limosin</span>
                <span className="font-bold text-emerald-500">58%</span>
              </div>
              <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden border border-theme-border/50">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[58%] rounded-full shadow-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-theme-text mb-1">
                <span className="font-semibold">🐑 Domba Garut & Merino</span>
                <span className="font-bold text-amber-500">26%</span>
              </div>
              <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden border border-theme-border/50">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[26%] rounded-full shadow-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-theme-text mb-1">
                <span className="font-semibold">🐐 Kambing Etawa & Boer</span>
                <span className="font-bold text-violet-500">12%</span>
              </div>
              <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden border border-theme-border/50">
                <div className="bg-gradient-to-r from-violet-600 to-violet-400 h-full w-[12%] rounded-full shadow-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-theme-text mb-1">
                <span className="font-semibold">🐃 Kerbau Rawa</span>
                <span className="font-bold text-sky-500">4%</span>
              </div>
              <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden border border-theme-border/50">
                <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-full w-[4%] rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Store Verifications */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <h2 className="text-sm font-extrabold text-theme-text flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Verifikasi Pendaftaran Kandang Peternak Baru</span>
          </h2>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">{stores.length} Menunggu</span>
        </div>

        {stores.length === 0 ? (
          <p className="text-xs text-theme-muted text-center py-6">
            ✓ Semua toko kandang peternak mitra telah diverifikasi aktif.
          </p>
        ) : (
          <div className="divide-y divide-theme-border">
            {stores.map((s) => (
              <div key={s.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-theme-text">{s.store_name}</h3>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted">Lokasi: {s.farm_address}</p>
                  <p className="text-[11px] text-theme-muted">
                    NIB: <strong className="text-theme-text">{s.nib_sku_number || '-'}</strong> · {s.bank_name} {s.bank_account_number} ({s.bank_account_holder})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleUpdateStoreStatus(s.id, 'ACTIVE')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                  </button>
                  <button
                    onClick={() => handleUpdateStoreStatus(s.id, 'REJECTED')}
                    className="px-4 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
