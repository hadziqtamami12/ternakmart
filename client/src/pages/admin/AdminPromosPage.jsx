// AdminPromosPage.jsx - Dedicated Campaign & Promo Management
import React, { useState, useEffect } from 'react';
import {
  Tag,
  Percent,
  Calendar,
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Store,
  Clock,
  Check,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import TierBadge from '../../components/common/TierBadge';
import { formatRupiah } from '../../utils/formatters';

const STORAGE_KEY = 'ternakmart_campaign_promos';

const INITIAL_PROMOS = [
  {
    id: 'prm_001',
    title: 'Gebyar Qurban Berkah 1447H',
    coupon_code: 'QURBANBERKAH',
    discount_percent: 10,
    target_type: 'ALL', // 'ALL' | 'SPECIFIC'
    animal_ids: [],
    start_date: '2026-06-01',
    end_date: '2026-06-25',
    target_badge: 'ALL', // 'ALL' | 'gold' | 'platinum' | 'silver'
    description: 'Diskon 10% untuk pemesanan sapi & domba qurban bersertifikat SKKH.',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prm_002',
    title: 'Flash Sale Domba Garut Juara',
    coupon_code: 'DOMBAJUARA15',
    discount_percent: 15,
    target_type: 'SPECIFIC',
    animal_ids: ['anm_002', 'anm_004'],
    start_date: '2026-09-10',
    end_date: '2026-09-20',
    target_badge: 'ALL',
    description: 'Potongan kilat 15% khusus domba indukan dan pejantan super Garut.',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prm_003',
    title: 'Apresiasi Peternak & Merchant Gold',
    coupon_code: 'GOLDEXCLUSIVE',
    discount_percent: 12,
    target_type: 'ALL',
    animal_ids: [],
    start_date: '2026-09-01',
    end_date: '2026-10-01',
    target_badge: 'gold',
    description: 'Diskon eksklusif 12% untuk akun dengan tier Gold ke atas.',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Inline form state (No Modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    coupon_code: '',
    discount_percent: 10,
    target_type: 'ALL',
    animal_ids: [],
    start_date: '',
    end_date: '',
    target_badge: 'ALL',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadPromos();
    fetchAnimalsAndBadges();
  }, []);

  const loadPromos = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPromos(JSON.parse(stored));
      } else {
        setPromos(INITIAL_PROMOS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROMOS));
      }
    } catch (e) {
      setPromos(INITIAL_PROMOS);
    }
  };

  const savePromosToStorage = (updated) => {
    setPromos(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchAnimalsAndBadges = async () => {
    setLoading(true);
    try {
      const [animalRes, badgeRes] = await Promise.all([
        api.get('/animals'),
        api.get('/badges').catch(() => ({ data: [] }))
      ]);
      if (animalRes?.success && animalRes?.data) setAnimals(animalRes.data);
      if (badgeRes?.success && badgeRes?.data) setBadges(badgeRes.data);
    } catch (err) {
      console.warn('Failed to load animals or badges for promo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setEditingPromo(null);
    setFormData({
      title: '',
      coupon_code: '',
      discount_percent: 10,
      target_type: 'ALL',
      animal_ids: [],
      start_date: today,
      end_date: nextWeek,
      target_badge: 'ALL',
      description: '',
      is_active: true
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title || '',
      coupon_code: promo.coupon_code || '',
      discount_percent: promo.discount_percent || 10,
      target_type: promo.target_type || 'ALL',
      animal_ids: Array.isArray(promo.animal_ids) ? promo.animal_ids : [],
      start_date: promo.start_date || '',
      end_date: promo.end_date || '',
      target_badge: promo.target_badge || 'ALL',
      description: promo.description || '',
      is_active: promo.is_active ?? true
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleDelete = (promo) => {
    if (!window.confirm(`Hapus promo "${promo.title}"?`)) return;
    const updated = promos.filter(p => p.id !== promo.id);
    savePromosToStorage(updated);
    setSuccessMsg('Promo berhasil dihapus.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleStatus = (promoId) => {
    const updated = promos.map(p => {
      if (p.id === promoId) {
        return { ...p, is_active: !p.is_active };
      }
      return p;
    });
    savePromosToStorage(updated);
  };

  const handleSavePromo = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Nama promo wajib diisi.');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setErrorMsg('Tanggal mulai dan selesai wajib diisi.');
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setErrorMsg('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    if (editingPromo) {
      const updated = promos.map(p => {
        if (p.id === editingPromo.id) {
          return {
            ...p,
            ...formData,
            coupon_code: formData.coupon_code.toUpperCase().trim()
          };
        }
        return p;
      });
      savePromosToStorage(updated);
      setSuccessMsg('Promo berhasil diperbarui.');
    } else {
      const newPromo = {
        id: `prm_${Date.now()}`,
        ...formData,
        coupon_code: formData.coupon_code.toUpperCase().trim() || `DISKON${formData.discount_percent}`,
        created_at: new Date().toISOString()
      };
      savePromosToStorage([newPromo, ...promos]);
      setSuccessMsg('Promo baru berhasil dibuat.');
    }

    setIsFormOpen(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleAnimalSelection = (animalId) => {
    setFormData(prev => {
      const current = prev.animal_ids || [];
      if (current.includes(animalId)) {
        return { ...prev, animal_ids: current.filter(id => id !== animalId) };
      }
      return { ...prev, animal_ids: [...current, animalId] };
    });
  };

  // Filtered promos
  const filteredPromos = promos.filter(p => {
    if (statusFilter === 'ACTIVE') return p.is_active;
    if (statusFilter === 'INACTIVE') return !p.is_active;
    return true;
  });

  // Table columns definition
  const columns = [
    {
      header: 'Nama & Kode Promo',
      accessor: 'title',
      render: (p) => (
        <div className="space-y-1 min-w-0">
          <span className="font-extrabold text-theme-text block truncate text-xs">{p.title}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] bg-theme-bg border border-theme-border text-theme-primary px-2 py-0.5 rounded-lg font-bold">
              {p.coupon_code || 'NO-CODE'}
            </span>
            {p.description && (
              <span className="text-[10px] text-theme-muted truncate max-w-[220px]">
                • {p.description}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Diskon',
      accessor: 'discount_percent',
      align: 'center',
      render: (p) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-xs">
          <Percent className="w-3 h-3" />
          {p.discount_percent}% OFF
        </span>
      )
    },
    {
      header: 'Target Ternak',
      accessor: 'target_type',
      render: (p) => {
        if (p.target_type === 'ALL' || !p.animal_ids || p.animal_ids.length === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              <Store className="w-3 h-3" /> Semua Hewan
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-theme-text font-bold bg-theme-bg px-2 py-0.5 rounded-lg border border-theme-border">
            {p.animal_ids.length} Ternak Dipilih
          </span>
        );
      }
    },
    {
      header: 'Periode Promo',
      accessor: 'start_date',
      render: (p) => {
        const isExpired = p.end_date && new Date(p.end_date) < new Date();
        return (
          <div className="text-[11px] space-y-0.5">
            <div className="flex items-center gap-1 text-theme-text font-medium">
              <Calendar className="w-3 h-3 text-theme-muted" />
              <span>{p.start_date} s/d {p.end_date}</span>
            </div>
            {isExpired ? (
              <span className="text-[9px] text-rose-500 font-bold">● Berakhir</span>
            ) : (
              <span className="text-[9px] text-emerald-500 font-bold">● Periode Aktif</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Sasaran Badge',
      accessor: 'target_badge',
      render: (p) => {
        if (!p.target_badge || p.target_badge === 'ALL') {
          return (
            <span className="text-[11px] font-bold text-theme-muted">
              Semua Pengguna
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <TierBadge badge={{ name: p.target_badge }} size="xs" />
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'is_active',
      align: 'center',
      render: (p) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(p.id)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
            p.is_active
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
          }`}
          title="Klik untuk ubah status aktif"
        >
          {p.is_active ? 'AKTIF' : 'NONAKTIF'}
        </button>
      )
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border transition-colors"
            title="Edit Promo"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
            title="Hapus Promo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-theme-border pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text transition-colors"
              title="Kembali ke Daftar Promo"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
                <Percent className="w-6 h-6 text-rose-500" />
                <span>{editingPromo ? `Edit Promo: ${editingPromo.title}` : 'Buat Kampanye Promo Baru'}</span>
              </h1>
              <p className="text-xs text-theme-muted mt-0.5">
                {editingPromo ? 'Perbarui besaran diskon, tanggal berlaku, atau hewan ternak promosi.' : 'Lengkapi detail kupon dan besaran persentase diskon potongan harga ternak.'}
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl">
          <form onSubmit={handleSavePromo} className="space-y-5 text-xs">
            {/* Promo Title & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Nama Kampanye Promo *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Flash Sale Idul Adha"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Kode Kupon / Voucher</label>
                <input
                  type="text"
                  placeholder="Contoh: QURBAN2026"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text font-mono uppercase focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Discount % & Badge Qualification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Besaran Diskon (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: Math.min(90, Math.max(1, Number(e.target.value) || 0)) })}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 pr-8 text-theme-text font-bold focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-rose-500">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Sasaran Tier Badge Pengguna *</label>
                <select
                  value={formData.target_badge}
                  onChange={(e) => setFormData({ ...formData, target_badge: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="ALL">Semua Pengguna (Semua Badge)</option>
                  <option value="silver">Khusus Badge Silver</option>
                  <option value="gold">Khusus Badge Gold</option>
                  <option value="platinum">Khusus Badge Platinum</option>
                </select>
              </div>
            </div>

            {/* Date Range: Start to End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Dari Tanggal (Mulai) *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text">Sampai Tanggal (Berakhir) *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Product / Livestock Selection */}
            <div className="space-y-2 border-t border-theme-border pt-4">
              <label className="font-bold text-theme-text block">Pilih Cakupan Hewan Ternak:</label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target_type"
                    checked={formData.target_type === 'ALL'}
                    onChange={() => setFormData({ ...formData, target_type: 'ALL', animal_ids: [] })}
                    className="accent-rose-500"
                  />
                  <span className="font-semibold text-theme-text">Semua Hewan Ternak</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target_type"
                    checked={formData.target_type === 'SPECIFIC'}
                    onChange={() => setFormData({ ...formData, target_type: 'SPECIFIC' })}
                    className="accent-rose-500"
                  />
                  <span className="font-semibold text-theme-text">Pilih Ternak Tertentu</span>
                </label>
              </div>

              {/* Animals Checkbox list */}
              {formData.target_type === 'SPECIFIC' && (
                <div className="mt-2 border border-theme-border rounded-2xl p-4 max-h-56 overflow-y-auto space-y-2 bg-theme-bg">
                  <span className="text-[11px] text-theme-muted block font-medium">
                    Centang hewan ternak yang berhak mendapatkan diskon {formData.discount_percent}%:
                  </span>
                  {animals.length === 0 ? (
                    <p className="text-xs text-theme-muted italic">Tidak ada katalog ternak tersedia.</p>
                  ) : (
                    animals.map((anm) => {
                      const isSelected = formData.animal_ids.includes(anm.id);
                      return (
                        <div
                          key={anm.id}
                          onClick={() => toggleAnimalSelection(anm.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500/40 text-theme-text'
                              : 'hover:bg-theme-card border-transparent text-theme-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-rose-500 rounded"
                            />
                            <img
                              src={anm.image_url || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=80'}
                              alt={anm.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate text-theme-text">{anm.name}</p>
                              <p className="text-[10px] text-theme-muted">{formatRupiah(anm.price)}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-card border border-theme-border">
                            {anm.category || 'Ternak'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Description / Terms */}
            <div className="space-y-1.5">
              <label className="font-bold text-theme-text">Deskripsi / Syarat Ketentuan Promo</label>
              <textarea
                rows="3"
                placeholder="Keterangan syarat klaim diskon..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-theme-text focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-bg border border-theme-border">
              <div>
                <span className="font-bold text-theme-text block">Status Promo Langsung Aktif</span>
                <span className="text-[11px] text-theme-muted">Jika diaktifkan, promo dapat langsung digunakan di checkout.</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme-border">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md shadow-rose-600/25 transition-all"
              >
                {editingPromo ? 'Simpan Perubahan' : 'Simpan Promo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
            <Percent className="w-6 h-6 text-rose-500" />
            <span>Kelola Promo & Diskon Ternak</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Atur diskon persen, batasan tanggal aktif, hewan yang dipromosikan, serta sasaran level badge pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAnimalsAndBadges}
            className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Promo Baru</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Promo DataTable */}
      <DataTable
        columns={columns}
        data={filteredPromos}
        loading={loading}
        searchPlaceholder="Cari nama promo, kode kupon, deskripsi..."
        searchKeys={['title', 'coupon_code', 'description', 'target_badge']}
        emptyMessage="Belum ada promo yang terdaftar. Klik 'Buat Promo Baru' untuk memulai."
        filterSlot={(
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-muted font-bold whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-theme-card border border-theme-border rounded-xl px-3 py-1.5 text-xs text-theme-text font-bold focus:outline-none focus:border-rose-500 cursor-pointer shadow-sm"
            >
              <option value="ALL">Semua Promo ({promos.length})</option>
              <option value="ACTIVE">Hanya Promo Aktif</option>
              <option value="INACTIVE">Hanya Nonaktif</option>
            </select>
          </div>
        )}
      />
    </div>
  );
}
