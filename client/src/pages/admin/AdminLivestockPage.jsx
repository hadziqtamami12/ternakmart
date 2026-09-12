// AdminLivestockPage.jsx - Full Animal CRUD DataTable for Super Admin with Numbering & Pagination
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
  X
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';

export default function AdminLivestockPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
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
          setIsModalOpen(false);
          setSuccessMsg(`✓ Ternak '${formData.title}' berhasil diperbarui!`);
          fetchAnimals();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const res = await api.post('/animals', payload);
        if (res.success) {
          setIsModalOpen(false);
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
            className="w-9 h-9 rounded-lg object-cover border border-slate-700 flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-white block truncate max-w-[170px]">{animal.title}</span>
            <span className="text-[10px] text-slate-500 font-mono">{animal.skkh_number || 'Tanpa SKKH'}</span>
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
          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-800 text-slate-200">
            {animal.category}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{animal.breed || '-'}</span>
        </div>
      )
    },
    {
      header: 'Bobot & Poel',
      accessor: 'weight_kg',
      render: (animal) => (
        <div>
          <span className="font-bold text-slate-200 block">{formatWeight(animal.weight_kg)}</span>
          <span className="text-[10px] text-slate-500">{animal.teeth_poel?.replace('_', ' ') || '-'}</span>
        </div>
      )
    },
    {
      header: 'Harga Satuan',
      accessor: 'price',
      render: (animal) => (
        <span className="font-black text-emerald-400 block">
          {formatRupiah(animal.price)}
        </span>
      )
    },
    {
      header: 'SKKH & Qurban',
      accessor: 'is_qurban_eligible',
      render: (animal) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-400">
            <ShieldCheck className="w-3 h-3 text-teal-400" /> Sah SKKH
          </span>
          {animal.is_qurban_eligible && (
            <span className="block text-[9px] text-amber-400 font-bold">✓ Syarat Qurban</span>
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
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Edit Hewan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(animal)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            title="Hapus Hewan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🐂 Manajemen & CRUD Hewan Ternak (DataTable)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola katalog hewan ternak, tambah spesimen baru, perbarui bobot riil, dan verifikasi sertifikat SKKH dinas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAnimals}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ternak</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        )}
      />

      {/* Modal Form Tambah / Edit Ternak */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{editingAnimal ? 'Edit Data Ternak' : 'Tambah Ternak Baru'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Nama / Judul Ternak *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Sapi Simental Bobot 480kg Siap Qurban"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="SAPI">SAPI</option>
                    <option value="KAMBING">KAMBING</option>
                    <option value="DOMBA">DOMBA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Ras / Breed</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Contoh: Limousin / Garut Super"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Bobot Timbangan (Kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Harga Satuan (Rupiah) *</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Gigi Poel</label>
                  <select
                    value={formData.teeth_poel}
                    onChange={(e) => setFormData({ ...formData, teeth_poel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1_PASANG">1 Pasang (Cukup Umur)</option>
                    <option value="2_PASANG">2 Pasang (Dewasa Optimal)</option>
                    <option value="3_PASANG">3 Pasang (Matang)</option>
                    <option value="BELUM_POEL">Belum Poel</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nomor SKKH Dinas *</label>
                  <input
                    type="text"
                    required
                    value={formData.skkh_number}
                    onChange={(e) => setFormData({ ...formData, skkh_number: e.target.value })}
                    placeholder="SKKH-DKP-2026-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">URL Foto Ternak</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.is_qurban_eligible}
                      onChange={(e) => setFormData({ ...formData, is_qurban_eligible: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-200 text-xs">Memenuhi Syarat Sah Ibadah Qurban (Sehat, Cukup Umur, Fisik Sempurna)</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Deskripsi Spesimen</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg"
                >
                  {saving ? 'Menyimpan...' : editingAnimal ? 'Perbarui Ternak' : 'Tambah Ternak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
