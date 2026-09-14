// CatalogPage.jsx - Comprehensive Livestock Catalog with Multi-column Filters & 1:1 Skeletons
import React, { useState, useEffect } from 'react';
import { Filter, Search, RotateCcw, ShieldCheck, Play, Award, Check, X, ShoppingBag } from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { LivestockCardSkeleton } from '../components/common/Skeletons';
import { useAppConfig } from '../context/AppConfigContext';
import { useCart } from '../context/CartContext';

export default function CatalogPage({ initialCategory, searchQuery, onSelectAnimal }) {
  const { setDocumentTitle } = useAppConfig();
  const { addToCart } = useCart();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState(initialCategory || '');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isQurban, setIsQurban] = useState('');
  const [skkhOnly, setSkkhOnly] = useState(false);
  const [teethPoel, setTeethPoel] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchQuery || '');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    setDocumentTitle('Katalog Hewan Ternak');
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (minWeight) params.append('min_weight', minWeight);
      if (maxWeight) params.append('max_weight', maxWeight);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (isQurban !== '') params.append('is_qurban_eligible', isQurban);
      if (skkhOnly) params.append('skkh_verified', 'true');
      if (teethPoel) params.append('teeth_poel', teethPoel);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);

      const res = await api.get(`/animals?${params.toString()}`);
      if (res.success && res.data) {
        setAnimals(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch catalog animals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnimals();
    }, 250);
    return () => clearTimeout(timer);
  }, [category, minWeight, maxWeight, minPrice, maxPrice, isQurban, skkhOnly, teethPoel, sort, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnimals();
  };

  const handleResetFilters = () => {
    setCategory('');
    setMinWeight('');
    setMaxWeight('');
    setMinPrice('');
    setMaxPrice('');
    setIsQurban('');
    setSkkhOnly(false);
    setTeethPoel('');
    setSort('newest');
    setSearch('');
  };

  const filteredAnimals = Array.isArray(animals) ? animals : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-28">
      {/* Title & Quick Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text tracking-tight">
            Katalog Hewan Ternak
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted mt-1">
            Menampilkan {filteredAnimals.length} hewan ternak sehat bersertifikasi resmi
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="lg:hidden px-4 py-2 rounded-xl bg-theme-card border border-theme-border text-xs font-bold flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-theme-primary" />
            Filter
          </button>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs font-semibold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga: Terendah</option>
            <option value="price_desc">Harga: Tertinggi</option>
            <option value="weight_desc">Bobot: Paling Berat</option>
            <option value="weight_asc">Bobot: Paling Ringan</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Sidebar Filter + 4-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6 bg-theme-card border border-theme-border rounded-3xl p-6 h-fit sticky top-28">
          <div className="flex items-center justify-between border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-theme-primary" /> Filter Ternak
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-theme-muted hover:text-theme-primary flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Live Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Cari Cepat</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik nama, ras, atau peternakan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Dropdown Search */}
          <div className="pt-3 border-t border-theme-border space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Kategori Ternak</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-medium"
            >
              <option value="">Semua Kategori Ternak</option>
              <option value="SAPI">Sapi Qurban & Pedaging</option>
              <option value="DOMBA">Domba Garut & Priangan</option>
              <option value="KAMBING">Kambing Etawa & Senduro</option>
              <option value="KERBAU">Kerbau Rawa Lokal</option>
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className="pt-3 border-t border-theme-border space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Rentang Harga</label>
            <select
              value={
                minPrice === '' && maxPrice === '' ? '' :
                maxPrice === '10000000' ? 'under_10' :
                minPrice === '10000000' && maxPrice === '30000000' ? '10_30' :
                minPrice === '30000000' && maxPrice === '50000000' ? '30_50' :
                minPrice === '50000000' ? 'above_50' : 'custom'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') { setMinPrice(''); setMaxPrice(''); }
                else if (val === 'under_10') { setMinPrice(''); setMaxPrice('10000000'); }
                else if (val === '10_30') { setMinPrice('10000000'); setMaxPrice('30000000'); }
                else if (val === '30_50') { setMinPrice('30000000'); setMaxPrice('50000000'); }
                else if (val === 'above_50') { setMinPrice('50000000'); setMaxPrice(''); }
              }}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-medium"
            >
              <option value="">Semua Rentang Harga</option>
              <option value="under_10">Di bawah Rp 10.000.000</option>
              <option value="10_30">Rp 10 Juta - Rp 30 Juta</option>
              <option value="30_50">Rp 30 Juta - Rp 50 Juta</option>
              <option value="above_50">Di atas Rp 50.000.000 (Jumbo)</option>
              <option value="custom">Kustom Angka Manual</option>
            </select>
          </div>

          {/* Weight Range Dropdown */}
          <div className="pt-3 border-t border-theme-border space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Rentang Bobot</label>
            <select
              value={
                minWeight === '' && maxWeight === '' ? '' :
                maxWeight === '50' ? 'under_50' :
                minWeight === '50' && maxWeight === '100' ? '50_100' :
                minWeight === '100' && maxWeight === '500' ? '100_500' :
                minWeight === '500' ? 'above_500' : 'custom'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') { setMinWeight(''); setMaxWeight(''); }
                else if (val === 'under_50') { setMinWeight(''); setMaxWeight('50'); }
                else if (val === '50_100') { setMinWeight('50'); setMaxWeight('100'); }
                else if (val === '100_500') { setMinWeight('100'); setMaxWeight('500'); }
                else if (val === 'above_500') { setMinWeight('500'); setMaxWeight(''); }
              }}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-medium"
            >
              <option value="">Semua Rentang Bobot</option>
              <option value="under_50">Di bawah 50 kg</option>
              <option value="50_100">50 kg - 100 kg</option>
              <option value="100_500">100 kg - 500 kg</option>
              <option value="above_500">Di atas 500 kg (Sapi Jumbo)</option>
              <option value="custom">Kustom Bobot Manual</option>
            </select>
          </div>

          {/* SKKH Official Verification Toggle */}
          <div className="pt-3 border-t border-theme-border">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hanya SKKH Sah
              </span>
              <input
                type="checkbox"
                checked={skkhOnly}
                onChange={(e) => setSkkhOnly(e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4 h-4"
              />
            </label>
          </div>

          {/* Qurban Eligible */}
          <div className="pt-3 border-t border-theme-border space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Kelayakan Qurban</label>
            <select
              value={isQurban}
              onChange={(e) => setIsQurban(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
            >
              <option value="">Semua Status Qurban</option>
              <option value="true">Memenuhi Syarat Sah Qurban</option>
              <option value="false">Non-Qurban / Penggemukan</option>
            </select>
          </div>

          {/* Teeth Poel */}
          <div className="pt-3 border-t border-theme-border space-y-1.5">
            <label className="text-xs font-bold text-theme-text uppercase tracking-wider block">Status Gigi Poel</label>
            <select
              value={teethPoel}
              onChange={(e) => setTeethPoel(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
            >
              <option value="">Semua Tingkat Gigi Poel</option>
              <option value="BELUM_POEL">Belum Poel</option>
              <option value="POEL_1">Poel 1 Pasang</option>
              <option value="POEL_2">Poel 2 Pasang</option>
            </select>
          </div>
        </div>

        {/* 3 or 4 Column Catalog Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LivestockCardSkeleton key={i} />
              ))}
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-20 bg-theme-card border border-theme-border rounded-3xl p-8 space-y-4">
              <div className="text-4xl">🌾</div>
              <h3 className="text-lg font-bold text-theme-text">Tidak ada ternak yang sesuai kriteria</h3>
              <p className="text-xs text-theme-muted max-w-sm mx-auto">
                Coba atur ulang filter kategori, bobot, atau kata kunci pencarian Anda untuk melihat ternak lainnya.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => onSelectAnimal(animal)}
                  className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-sm hover:shadow-elevated hover:border-theme-primary/40 cursor-pointer transition-all flex flex-col group"
                >
                  {/* Photo & Pills */}
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={animal.images[0] || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'}
                      alt={animal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider">
                      {animal.category}
                    </span>

                    {animal.skkh_verification_status && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> SKKH Sah
                      </span>
                    )}

                    {animal.video_url && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> Video
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-theme-muted mb-1">
                        <span>{animal.store?.store_name || 'Kandang Peternak'}</span>
                      </div>
                      <h3 className="font-bold text-sm text-theme-text line-clamp-1 group-hover:text-theme-primary transition-colors">
                        {animal.title}
                      </h3>
                      <p className="text-[11px] text-theme-muted mt-0.5">{animal.breed}</p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-xl bg-theme-bg text-xs">
                      <div>
                        <span className="text-theme-muted text-[10px] block">Bobot Riil:</span>
                        <span className="font-bold text-theme-text">{formatWeight(animal.weight_kg)}</span>
                      </div>
                      <div>
                        <span className="text-theme-muted text-[10px] block">Gigi Poel:</span>
                        <span className="font-bold text-theme-text">{animal.teeth_poel.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-theme-muted block">Harga Ternak</span>
                        <span className="text-base font-black text-theme-primary">
                          {formatRupiah(animal.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(animal);
                          }}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white dark:text-emerald-400 transition flex items-center justify-center"
                          title="Tambah ke Keranjang"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 rounded-xl bg-theme-primary-light text-theme-primary text-xs font-bold">
                          Pilih
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-Height Mobile Filter Overlay (Completely Covers Topbar) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[9999] bg-theme-card flex flex-col w-full h-full lg:hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-theme-border flex items-center justify-between flex-shrink-0 bg-theme-card sticky top-0 z-10 shadow-sm">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1.5 -ml-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg flex items-center gap-1 font-bold text-xs transition-colors"
            >
              <X className="w-5 h-5 text-theme-text" />
              <span>Tutup</span>
            </button>

            <h3 className="font-black text-sm text-theme-text flex items-center gap-2">
              <Filter className="w-4 h-4 text-theme-primary" />
              <span>Filter Hewan Ternak</span>
            </h3>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-theme-primary/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Scrollable Filter Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-28">
            {/* Live Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Cari Nama / Ras Hewan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik Sapi Limosin, Domba Garut, Etawa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-9 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
                <Search className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-2.5 p-1 text-theme-muted hover:text-theme-text text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Selector as Visual Chips */}
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Kategori Ternak
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '', label: 'Semua Kategori', icon: '🐄' },
                  { id: 'SAPI', label: 'Sapi Qurban & Pedaging', icon: '🐂' },
                  { id: 'DOMBA', label: 'Domba Garut & Dorper', icon: '🐑' },
                  { id: 'KAMBING', label: 'Kambing Etawa & Jawa', icon: '🐐' },
                  { id: 'KERBAU', label: 'Kerbau Rawa / Lumpur', icon: '🐃' },
                  { id: 'UNGGAS', label: 'Ayam & Bebek', icon: '🐓' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border text-left ${
                      category === cat.id
                        ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                        : 'bg-theme-bg text-theme-text border-theme-border hover:border-theme-primary/40'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Chips */}
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Rentang Harga
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Semua Harga', min: '', max: '' },
                  { label: '< Rp 10 Juta', min: '', max: '10000000' },
                  { label: 'Rp 10 - 30 Juta', min: '10000000', max: '30000000' },
                  { label: 'Rp 30 - 50 Juta', min: '30000000', max: '50000000' },
                  { label: '> Rp 50 Juta (Super)', min: '50000000', max: '' }
                ].map((pr, idx) => {
                  const active = minPrice === pr.min && maxPrice === pr.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setMinPrice(pr.min); setMaxPrice(pr.max); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        active
                          ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                          : 'bg-theme-bg text-theme-text border-theme-border'
                      }`}
                    >
                      {pr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight Range Chips */}
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Rentang Bobot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Semua Bobot', min: '', max: '' },
                  { label: '< 50 kg', min: '', max: '50' },
                  { label: '50 - 100 kg', min: '50', max: '100' },
                  { label: '100 - 500 kg', min: '100', max: '500' },
                  { label: '> 500 kg (Jumbo)', min: '500', max: '' }
                ].map((wt, idx) => {
                  const active = minWeight === wt.min && maxWeight === wt.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setMinWeight(wt.min); setMaxWeight(wt.max); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        active
                          ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                          : 'bg-theme-bg text-theme-text border-theme-border'
                      }`}
                    >
                      {wt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teeth Poel Filter (Syarat Qurban) */}
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Kondisi Gigi Poel (Syarat Qurban)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '', label: 'Semua Status' },
                  { id: 'BELUM_POEL', label: 'Belum Poel (Muda)' },
                  { id: 'POEL_1', label: 'Poel 1 Pasang (Sah Qurban)' },
                  { id: 'POEL_2', label: 'Poel 2 Pasang (Dewasa)' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTeethPoel(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      teethPoel === p.id
                        ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                        : 'bg-theme-bg text-theme-text border-theme-border'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality & Legal Badges */}
            <div className="space-y-2.5 pt-2 border-t border-theme-border">
              <label className="text-xs font-black text-theme-text uppercase tracking-wider block">
                Sertifikasi & Kualitas
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-theme-bg border border-theme-border cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skkhOnly}
                  onChange={(e) => setSkkhOnly(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-theme-text">Hanya Bersertifikat SKKH</span>
                  </div>
                  <p className="text-[10px] text-theme-muted">Telah diverifikasi dokter hewan & dinas peternakan</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-theme-bg border border-theme-border cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isQurban === 'true'}
                  onChange={(e) => setIsQurban(e.target.checked ? 'true' : '')}
                  className="rounded text-theme-primary focus:ring-theme-primary h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-theme-text">Hanya Ternak Siap Qurban</span>
                  </div>
                  <p className="text-[10px] text-theme-muted">Cukup umur, sehat, dan tidak cacat fisik</p>
                </div>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 border-t border-theme-border bg-theme-card sticky bottom-0 z-20 shadow-2xl safe-area-bottom flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Terapkan Filter ({filteredAnimals?.length || 0} Ternak Ditemukan)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
