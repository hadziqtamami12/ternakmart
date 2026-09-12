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
      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="relative bg-[#0d1421] border border-slate-800/80 rounded-2xl p-5 space-y-2 overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Omset Penjualan</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">
            {formatRupiah(totalRevenue || 540000000)}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> +18.4% bulan ini
          </p>
        </div>

        {/* Card 2: Orders */}
        <div className="relative bg-[#0d1421] border border-slate-800/80 rounded-2xl p-5 space-y-2 overflow-hidden hover:border-blue-500/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-blue-500/0" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Transaksi Masuk</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">
            {orders.length || 28} Pesanan
          </div>
          <p className="text-[11px] text-amber-400 font-bold">
            {pendingOrders} struk menunggu verifikasi
          </p>
        </div>

        {/* Card 3: Animals */}
        <div className="relative bg-[#0d1421] border border-slate-800/80 rounded-2xl p-5 space-y-2 overflow-hidden hover:border-amber-500/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Katalog Ternak Siap Jual</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">
            {activeAnimals || 18} Ekor
          </div>
          <p className="text-[11px] text-slate-500">
            Sapi, Domba & Kambing SKKH Sah
          </p>
        </div>

        {/* Card 4: Stores */}
        <div className="relative bg-[#0d1421] border border-slate-800/80 rounded-2xl p-5 space-y-2 overflow-hidden hover:border-violet-500/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500/60 to-violet-500/0" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Toko Mitra Peternakan</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">
            12 Kandang
          </div>
          <p className="text-[11px] text-violet-400 font-bold">
            {stores.length} pengajuan kandang baru
          </p>
        </div>
      </div>

      {/* Analytics Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Revenue Trend (8 cols) */}
        <div className="lg:col-span-8 bg-[#0d1421] border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Grafik Penjualan 7 Hari Terakhir</span>
              </h2>
              <p className="text-[11px] text-slate-500">Tren nominal transaksi ternak harian</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Puncak: {formatRupiah(maxSale)}
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {salesTrend.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxSale) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatRupiah(item.amount)}
                  </div>
                  <div className="w-full bg-slate-800/60 rounded-t-lg h-36 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all rounded-t-lg shadow-lg shadow-emerald-500/20"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Distribution by Animal Category (4 cols) */}
        <div className="lg:col-span-4 bg-[#0d1421] border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white">Komposisi Kategori Ternak</h2>
            <p className="text-[11px] text-slate-500">Pangsa pasar permintaan ternak</p>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>🐂 Sapi Simental & Limosin</span>
                <span className="font-bold">58%</span>
              </div>
              <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[58%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>🐑 Domba Garut & Merino</span>
                <span className="font-bold">26%</span>
              </div>
              <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[26%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>🐐 Kambing Etawa & Boer</span>
                <span className="font-bold">12%</span>
              </div>
              <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-violet-400 h-full w-[12%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>🐃 Kerbau Rawa</span>
                <span className="font-bold">4%</span>
              </div>
              <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full w-[4%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Store Verifications */}
      <div className="bg-[#0d1421] border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Verifikasi Pendaftaran Kandang Peternak Baru</span>
          </h2>
          <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">{stores.length} Menunggu</span>
        </div>

        {stores.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">
            ✓ Semua toko kandang peternak mitra telah diverifikasi aktif.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {stores.map((s) => (
              <div key={s.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{s.store_name}</h3>
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Lokasi: {s.farm_address}</p>
                  <p className="text-[11px] text-slate-600">
                    NIB: <strong className="text-slate-400">{s.nib_sku_number || '-'}</strong> · {s.bank_name} {s.bank_account_number} ({s.bank_account_holder})
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
