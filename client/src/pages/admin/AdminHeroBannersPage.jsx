// AdminHeroBannersPage.jsx - Dedicated Full Management for Marketplace Hero Section
import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  ArrowRight,
  Sparkles,
  Tag,
  Image as ImageIcon,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inline Form State (No Modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({
    badge: 'FESTIVAL AKBAR QURBAN 1447H',
    categoryBadge: '🐂 SAPI & DOMBA SUPER',
    tag: 'Kupon: QURBANBERKAH',
    title: '',
    subtitle: '',
    cta: 'Beli Ternak Qurban',
    category: 'SAPI',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&auto=format&fit=crop&q=85',
    is_active: true,
    sort_order: 1
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/hero-banners');
      if (res.success && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar banner hero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateForm = () => {
    setEditingBanner(null);
    setForm({
      badge: 'FESTIVAL AKBAR QURBAN 1447H',
      categoryBadge: '🐂 SAPI & DOMBA SUPER',
      tag: 'Kupon: QURBANBERKAH',
      title: '',
      subtitle: '',
      cta: 'Beli Ternak Qurban',
      category: 'SAPI',
      image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&auto=format&fit=crop&q=85',
      is_active: true,
      sort_order: banners.length + 1
    });
    setIsFormOpen(true);
  };

  const openEditForm = (banner) => {
    setEditingBanner(banner);
    setForm({
      badge: banner.badge || '',
      categoryBadge: banner.categoryBadge || '',
      tag: banner.tag || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      cta: banner.cta || 'Beli Ternak Qurban',
      category: banner.category || 'SAPI',
      image: banner.image || '',
      is_active: banner.is_active !== false,
      sort_order: banner.sort_order || 1
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      alert('Judul dan URL gambar wajib diisi.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingBanner) {
        const res = await api.put(`/hero-banners/${editingBanner.id}`, form);
        if (res.success) {
          setSuccessMsg('Banner hero berhasil diperbarui!');
          setIsFormOpen(false);
          fetchBanners();
        }
      } else {
        const res = await api.post('/hero-banners', form);
        if (res.success) {
          setSuccessMsg('Banner hero baru berhasil ditambahkan!');
          setIsFormOpen(false);
          fetchBanners();
        }
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan banner hero.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus banner "${title}"?`)) return;
    try {
      const res = await api.delete(`/hero-banners/${id}`);
      if (res.success) {
        setSuccessMsg('Banner hero berhasil dihapus.');
        fetchBanners();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus banner.');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await api.put(`/hero-banners/${banner.id}`, {
        is_active: !banner.is_active
      });
      if (res.success) {
        fetchBanners();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status aktif.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-theme-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-theme-primary" />
            <span>Kelola Hero Banner Slider</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Tambah, ubah urutan, aktifkan/nonaktifkan banner hero beranda yang ditampilkan ke seluruh pembeli.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isFormOpen && (
            <>
              <button
                onClick={fetchBanners}
                disabled={loading}
                className="p-2.5 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={openCreateForm}
                className="px-4 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Banner Baru</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DEDICATED INLINE FORM (NO MODAL) */}
      {isFormOpen ? (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-theme-border pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
                title="Kembali ke Daftar Banner"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-black text-theme-text flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-theme-primary" />
                  <span>{editingBanner ? 'Edit Banner Hero' : 'Tambah Banner Hero Baru'}</span>
                </h3>
                <p className="text-xs text-theme-muted mt-0.5">
                  Isi konfigurasi slide hero banner yang akan ditampilkan di landing page
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* Image URL & Preview */}
            <div className="space-y-1.5">
              <label className="text-theme-text font-bold block">URL Gambar Banner (Rasio 16:9 / Landscape HD) *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text focus:outline-none focus:border-theme-primary"
              />
              {form.image && (
                <div className="rounded-2xl overflow-hidden h-44 w-full border border-theme-border relative mt-2 bg-black/40">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold text-emerald-300">{form.badge}</span>
                    <p className="text-sm font-black truncate">{form.title || 'Judul Banner Anda'}</p>
                    <p className="text-xs text-slate-200 truncate">{form.subtitle}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <label className="text-theme-text font-bold block">Judul Utama Banner (Headline) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Festival Akbar Qurban 1447H"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text font-bold focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-theme-text font-bold block">Subjudul / Deskripsi Banner</label>
              <textarea
                rows={2}
                placeholder="Penjelasan penawaran, garansi timbangan, gratis pakan, dll..."
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-theme-text focus:outline-none focus:border-theme-primary leading-relaxed"
              />
            </div>

            {/* Badges & Tags row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Teks Badge (Paling Atas)</label>
                <input
                  type="text"
                  placeholder="Contoh: FESTIVAL AKBAR"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Badge Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: 🐂 SAPI & DOMBA SUPER"
                  value={form.categoryBadge}
                  onChange={(e) => setForm({ ...form, categoryBadge: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Tag Kupon / Info</label>
                <input
                  type="text"
                  placeholder="Contoh: Kupon: BERKAHQURBAN"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                />
              </div>
            </div>

            {/* CTA, Category target, Sort order & Active status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Teks Tombol (CTA)</label>
                <input
                  type="text"
                  placeholder="Beli Ternak Qurban"
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Filter Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                >
                  <option value="SAPI">SAPI</option>
                  <option value="DOMBA">DOMBA</option>
                  <option value="KAMBING">KAMBING</option>
                  <option value="KERBAU">KERBAU</option>
                  <option value="ALL">SEMUA HEWAN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-theme-text font-bold block">Urutan Slide (#)</label>
                <input
                  type="number"
                  min="1"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-theme-text font-bold pt-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-theme-primary accent-emerald-500"
                  />
                  <span>Aktif di Beranda</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-theme-border">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-black rounded-xl transition shadow-md"
              >
                {saving ? 'Menyimpan...' : 'Simpan Banner Hero'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Hero Banners Grid Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-theme-text">
              Daftar Slide Banner Aktif di Beranda ({banners.length})
            </h2>
            <span className="text-xs text-theme-muted">
              Slider berputar otomatis di halaman beranda
            </span>
          </div>

          {banners.length === 0 ? (
            <div className="bg-theme-card border border-theme-border rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-center mx-auto text-2xl">
                🖼️
              </div>
              <p className="text-sm font-bold text-theme-text">Belum Ada Banner Hero</p>
              <p className="text-xs text-theme-muted">Klik tombol "Tambah Banner Baru" untuk memasang slide promosi pertama Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {banners.map((banner, index) => (
                <div
                  key={banner.id || index}
                  className={`bg-theme-card border rounded-3xl overflow-hidden shadow-sm flex flex-col transition-all ${
                    banner.is_active !== false ? 'border-theme-border' : 'border-theme-border/50 opacity-60'
                  }`}
                >
                  {/* Visual Preview */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/80">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Badges on preview */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        Urutan: #{banner.sort_order || index + 1}
                      </span>

                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                          banner.is_active !== false
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-zinc-700/90 text-zinc-300'
                        }`}
                      >
                        {banner.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>

                    {/* Foreground text overlay */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {banner.badge && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300">
                            {banner.badge}
                          </span>
                        )}
                        {banner.tag && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/30">
                            {banner.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-white line-clamp-1">{banner.title}</h4>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-theme-muted line-clamp-2">
                        {banner.subtitle || 'Tidak ada deskripsi subjudul.'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-theme-text">
                        <span className="text-theme-muted">CTA:</span>
                        <span className="px-2 py-0.5 rounded-lg bg-theme-bg border border-theme-border text-theme-primary">
                          {banner.cta} → ({banner.category})
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-theme-border flex items-center justify-between gap-2">
                      <span className="text-[10px] text-theme-muted font-mono truncate">
                        ID: {banner.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditForm(banner)}
                          className="p-1.5 bg-theme-bg hover:bg-theme-border/50 text-theme-text rounded-xl border border-theme-border transition"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id, banner.title)}
                          className="p-1.5 bg-theme-bg hover:bg-rose-500/15 text-rose-500 rounded-xl border border-theme-border transition"
                          title="Hapus Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
