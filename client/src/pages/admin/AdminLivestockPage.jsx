// AdminLivestockPage.jsx - Full Animal Management DataTable for Super Admin with Numbering & Pagination
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  RefreshCw,
  Tag,
  X,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';

export default function AdminLivestockPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Inline Form state (No popup modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({
    title: '',
    category: 'SAPI',
    breed: 'Simental Super',
    weight_kg: 450,
    price: 24000000,
    teeth_poel: '2_PASANG',
    skkh_number: 'SKKH-DKP-2026-0091',
    is_qurban_eligible: true,
    image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
    description: 'Hewan ternak sehat terawat dari kandang resmi dengan pakan konsentrat berkualitas tinggi.'
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/animals');
      if (res.success && res.data) {
        setAnimals(res.data);
      }
    } catch (err) {
      console.warn('Error fetching animals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAnimal(null);
    setFormData({
      title: '',
      category: 'SAPI',
      breed: 'Simental',
      weight_kg: 400,
      price: 22000000,
      teeth_poel: '2_PASANG',
      skkh_number: `SKKH-DKP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      is_qurban_eligible: true,
      image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
      description: 'Hewan ternak sehat terawat bersertifikat SKKH resmi dinas peternakan.'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      title: animal.title || '',
      category: animal.category || 'SAPI',
      breed: animal.breed || '',
      weight_kg: animal.weight_kg || 400,
      price: animal.price || 0,
      teeth_poel: animal.teeth_poel || '2_PASANG',
      skkh_number: animal.skkh_number || '',
      is_qurban_eligible: !!animal.is_qurban_eligible,
      image_url: animal.images?.[0] || '',
      description: animal.description || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (animal) => {
    if (!window.confirm(`Hapus hewan ternak "${animal.title}"?`)) return;
    try {
      const res = await api.delete(`/animals/${animal.id}`);
      if (res.success) {
        setAnimals(prev => prev.filter(a => a.id !== animal.id));
        setSuccessMsg(`✓ Ternak '${animal.title}' berhasil dihapus.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus ternak.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        breed: formData.breed,
        weight_kg: parseFloat(formData.weight_kg),
        price: parseFloat(formData.price),
        teeth_poel: formData.teeth_poel,
        skkh_number: formData.skkh_number,
        is_qurban_eligible: formData.is_qurban_eligible,
        images: [formData.image_url],
        description: formData.description
      };

      if (editingAnimal) {
        const res = await api.put(`/animals/${editingAnimal.id}`, payload);
        if (res.success) {
          setIsFormOpen(false);
          setSuccessMsg(`✓ Ternak '${formData.title}' berhasil diperbarui!`);
          fetchAnimals();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const res = await api.post('/animals', payload);
        if (res.success) {
          setIsFormOpen(false);
          setSuccessMsg(`✓ Ternak baru '${formData.title}' berhasil ditambahkan!`);
          fetchAnimals();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data hewan ternak.');
    } finally {
      setSaving(false);
    }
  };

  const filteredAnimals = animals.filter(a => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    return true;
  });

  const columns = [
    {
      header: 'Hewan Ternak',
      accessor: 'title',
      render: (animal) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={animal.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
            alt={animal.title}
            className="w-9 h-9 rounded-lg object-cover border border-theme-border flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-theme-text block truncate max-w-[170px]">{animal.title}</span>
            <span className="text-[10px] text-theme-muted font-mono">{animal.skkh_number || 'Tanpa SKKH'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Kategori & Ras',
      accessor: 'category',
      mobileHeaderBadge: true,
      render: (animal) => (
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-theme-bg border border-theme-border text-theme-text">
            {animal.category}
          </span>
          <span className="text-[10px] text-theme-muted block mt-0.5">{animal.breed || '-'}</span>
        </div>
      )
    },
    {
      header: 'Bobot & Poel',
      accessor: 'weight_kg',
      render: (animal) => (
        <div>
          <span className="font-bold text-theme-text block">{formatWeight(animal.weight_kg)}</span>
          <span className="text-[10px] text-theme-muted">{animal.teeth_poel?.replace('_', ' ') || '-'}</span>
        </div>
      )
    },
    {
      header: 'Harga Satuan',
      accessor: 'price',
      render: (animal) => (
        <span className="font-black text-theme-primary block">
          {formatRupiah(animal.price)}
        </span>
      )
    },
    {
      header: 'SKKH & Qurban',
      accessor: 'is_qurban_eligible',
      render: (animal) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-500">
            <ShieldCheck className="w-3 h-3 text-teal-500" /> Sah SKKH
          </span>
          {animal.is_qurban_eligible && (
            <span className="block text-[9px] text-amber-500 font-bold">✓ Syarat Qurban</span>
          )}
        </div>
      )
    },
    {
      header: 'Aksi Admin',
      align: 'right',
      render: (animal) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(animal)}
            className="p-1.5 rounded-lg bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
            title="Edit Hewan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(animal)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
            title="Hapus Hewan"
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
              title="Kembali ke Daftar Ternak"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight">
                {editingAnimal ? `Edit Hewan Ternak: ${editingAnimal.title}` : 'Tambah Hewan Ternak Baru'}
              </h1>
              <p className="text-xs text-theme-muted mt-0.5">
                {editingAnimal ? 'Perbarui spesifikasi bobot, sertifikat SKKH, atau harga ternak.' : 'Lengkapi data hewan ternak bersertifikat untuk ditampilkan di katalog.'}
              </p>
            </div>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-theme-text block mb-1.5">Nama / Judul Ternak *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Sapi Simental Bobot 480kg Siap Qurban"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary font-bold cursor-pointer"
                >
                  <option value="SAPI">SAPI</option>
                  <option value="KAMBING">KAMBING</option>
                  <option value="DOMBA">DOMBA</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Ras / Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="Contoh: Limousin / Garut Super"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Bobot Timbangan (Kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Harga Satuan (Rupiah) *</label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-primary focus:outline-none focus:border-theme-primary font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Gigi Poel</label>
                <select
                  value={formData.teeth_poel}
                  onChange={(e) => setFormData({ ...formData, teeth_poel: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary cursor-pointer"
                >
                  <option value="1_PASANG">1 Pasang (Cukup Umur)</option>
                  <option value="2_PASANG">2 Pasang (Dewasa Optimal)</option>
                  <option value="3_PASANG">3 Pasang (Matang)</option>
                  <option value="BELUM_POEL">Belum Poel</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1.5">Nomor SKKH Dinas *</label>
                <input
                  type="text"
                  required
                  value={formData.skkh_number}
                  onChange={(e) => setFormData({ ...formData, skkh_number: e.target.value })}
                  placeholder="SKKH-DKP-2026-XXXX"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-theme-text block mb-1.5">URL Foto Ternak</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.is_qurban_eligible}
                    onChange={(e) => setFormData({ ...formData, is_qurban_eligible: e.target.checked })}
                    className="w-4 h-4 rounded text-theme-primary focus:ring-0"
                  />
                  <span className="font-bold text-theme-text text-xs">Memenuhi Syarat Sah Ibadah Qurban (Sehat, Cukup Umur, Fisik Sempurna)</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-theme-text block mb-1.5">Deskripsi Spesimen</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-3.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-theme-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                {saving ? 'Menyimpan...' : editingAnimal ? 'Simpan Perubahan' : 'Tambah Ternak Sekarang'}
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
            <span>🐂 Manajemen Hewan Ternak (DataTable)</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Kelola katalog hewan ternak, tambah spesimen baru, perbarui bobot riil, dan verifikasi sertifikat SKKH dinas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAnimals}
            className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ternak</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredAnimals}
        loading={loading}
        searchPlaceholder="Cari nama ternak, ras, nomor SKKH..."
        searchKeys={['title', 'category', 'breed', 'skkh_number', 'description']}
        emptyMessage="Tidak ada hewan ternak yang cocok dengan pencarian."
        filterSlot={(
          <div className="flex items-center gap-1">
            {['ALL', 'SAPI', 'KAMBING', 'DOMBA'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-theme-primary text-white shadow-sm'
                    : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        )}
      />
    </div>
  );
}
