import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  UserCheck,
  ShieldAlert,
  Sparkles,
  X,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah } from '../../utils/formatters';
import TierBadge from '../../components/common/TierBadge';

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inline Form state (No Modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    slug: '',
    icon_name: 'ShieldCheck',
    badge_color: '#3B82F6',
    min_successful_orders: 0,
    min_turnover_idr: 0
  });

  // User badge override state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [overrideBadgeId, setOverrideBadgeId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/badges');
      if (res.success && res.data) {
        setBadges(res.data);
        if (res.data.length > 0 && !overrideBadgeId) {
          setOverrideBadgeId(res.data[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar badge.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Gagal memuat daftar user:', err);
    }
  };

  useEffect(() => {
    fetchBadges();
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingBadge(null);
    setBadgeForm({
      name: '',
      slug: '',
      icon_name: 'ShieldCheck',
      badge_color: '#10B981',
      min_successful_orders: 0,
      min_turnover_idr: 0
    });
    setIsFormOpen(true);
  };

  const openEditModal = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      name: badge.name || '',
      slug: badge.slug || '',
      icon_name: badge.icon_name || 'ShieldCheck',
      badge_color: badge.badge_color || '#3B82F6',
      min_successful_orders: badge.min_successful_orders || 0,
      min_turnover_idr: badge.min_turnover_idr || 0
    });
    setIsFormOpen(true);
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingBadge) {
        const res = await api.put(`/badges/${editingBadge.id}`, badgeForm);
        if (res.success) {
          setSuccessMsg(`Badge "${badgeForm.name}" berhasil diperbarui.`);
        }
      } else {
        const res = await api.post('/badges', badgeForm);
        if (res.success) {
          setSuccessMsg(`Badge baru "${badgeForm.name}" berhasil ditambahkan.`);
        }
      }
      setIsFormOpen(false);
      fetchBadges();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan badge.');
    }
  };

  const handleDeleteBadge = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus tier badge "${name}"?`)) return;
    try {
      const res = await api.delete(`/badges/${id}`);
      if (res.success) {
        setSuccessMsg(`Badge "${name}" berhasil dihapus.`);
        fetchBadges();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Gagal menghapus badge.');
    }
  };

  const handleAssignBadge = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !overrideBadgeId) {
      alert('Pilih pengguna dan tier badge terlebih dahulu.');
      return;
    }
    setAssigning(true);
    setError('');
    try {
      const res = await api.post('/badges/assign', {
        user_id: selectedUserId,
        badge_id: overrideBadgeId
      });
      if (res.success) {
        setSuccessMsg('Tier badge pengguna berhasil diperbarui.');
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Gagal menugaskan badge ke user.');
    } finally {
      setAssigning(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (u.role === 'ADMIN') return false;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-theme-border pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text transition-colors"
              title="Kembali ke Daftar Badge"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-theme-primary" />
                <span>{editingBadge ? `Edit Tier Badge: ${editingBadge.name}` : 'Tambah Tier Badge Baru'}</span>
              </h1>
              <p className="text-xs text-theme-muted mt-0.5">
                {editingBadge ? 'Perbarui kualifikasi omset, jumlah order, atau warna badge.' : 'Definisikan kriteria tier baru untuk mitra peternakan atau pembeli.'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-theme-card border border-theme-border rounded-3xl max-w-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleSaveBadge} className="space-y-5 text-xs">
            <div>
              <label className="text-theme-text font-bold block mb-1.5">Nama Badge / Tier *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Gold Merchant"
                value={badgeForm.name}
                onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="text-theme-text font-bold block mb-1.5">Slug Identifier *</label>
              <input
                type="text"
                required
                placeholder="contoh: gold-merchant"
                value={badgeForm.slug}
                onChange={(e) => setBadgeForm({ ...badgeForm, slug: e.target.value })}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text font-mono focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-theme-text font-bold block mb-1.5">Icon Name</label>
                <select
                  value={badgeForm.icon_name}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon_name: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-theme-primary cursor-pointer font-bold"
                >
                  <option value="ShieldCheck">ShieldCheck</option>
                  <option value="Award">Award</option>
                  <option value="Crown">Crown</option>
                  <option value="Sparkles">Sparkles</option>
                  <option value="Medal">Medal</option>
                </select>
              </div>

              <div>
                <label className="text-theme-text font-bold block mb-1.5">Warna Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeForm.badge_color}
                    onChange={(e) => setBadgeForm({ ...badgeForm, badge_color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={badgeForm.badge_color}
                    onChange={(e) => setBadgeForm({ ...badgeForm, badge_color: e.target.value })}
                    className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-theme-text font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-theme-text font-bold block mb-1.5">Min. Order Sukses</label>
                <input
                  type="number"
                  min="0"
                  value={badgeForm.min_successful_orders}
                  onChange={(e) => setBadgeForm({ ...badgeForm, min_successful_orders: parseInt(e.target.value) || 0 })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="text-theme-text font-bold block mb-1.5">Min. Omset (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={badgeForm.min_turnover_idr}
                  onChange={(e) => setBadgeForm({ ...badgeForm, min_turnover_idr: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-theme-text focus:outline-none focus:border-theme-primary font-bold"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2">
              <span className="text-[10px] text-theme-muted font-bold uppercase block tracking-wider">Preview Tampilan Badge:</span>
              <TierBadge
                badge={{
                  name: badgeForm.name || 'Nama Badge',
                  slug: badgeForm.slug || 'slug',
                  icon_name: badgeForm.icon_name,
                  badge_color: badgeForm.badge_color
                }}
                size="md"
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
                className="px-6 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-extrabold rounded-xl transition shadow-md"
              >
                {editingBadge ? 'Simpan Perubahan' : 'Simpan Badge'}
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
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-theme-text">Manajemen Tier & Badge</h1>
              <p className="text-xs text-theme-muted mt-0.5">
                Kelola status tingkatan member (Silver, Gold, Platinum) & penugasan manual ke entitas peternak/pembeli.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBadges}
            className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Badge Baru</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Daftar Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className="bg-theme-card border border-theme-border rounded-2xl p-5 shadow-sm hover:border-theme-border/80 transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <TierBadge badge={b} size="md" />
                <span className="text-[10px] font-mono text-theme-muted bg-theme-bg border border-theme-border px-2 py-0.5 rounded-md">
                  {b.slug}
                </span>
              </div>

              <div className="space-y-1 text-xs text-theme-muted pt-1">
                <p>
                  Min. Order Selesai:{' '}
                  <strong className="text-theme-text font-bold">{b.min_successful_orders}x</strong>
                </p>
                <p>
                  Min. Omset Transaksi:{' '}
                  <strong className="text-theme-text font-bold">{formatRupiah(b.min_turnover_idr)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-theme-border text-xs">
              <span className="text-[10px] text-theme-muted">
                Diberikan ke: <strong className="text-theme-text">{users.filter(u => u.badge_id === b.id || u.tier_badge === b.slug).length} akun</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-theme-border transition"
                  title="Edit Badge"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBadge(b.id, b.name)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition"
                  title="Hapus Badge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Badge Manual ke User */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-theme-primary" />
            <h2 className="text-sm font-extrabold text-theme-text">Penugasan Manual Badge Tier ke Akun Pelanggan</h2>
          </div>
          <span className="text-[11px] text-theme-muted font-medium">Bypass otomatisasi omset</span>
        </div>

        <form onSubmit={handleAssignBadge} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* User selector with search */}
          <div className="sm:col-span-6 space-y-1">
            <label className="text-theme-muted block font-semibold">Pilih Akun Pengguna / Mitra</label>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Filter nama/email user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-1.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
              />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
              >
                <option value="">-- Pilih Akun User --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge target */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-theme-muted block font-semibold">Tingkatan Badge yang Diberikan</label>
            <select
              value={overrideBadgeId}
              onChange={(e) => setOverrideBadgeId(e.target.value)}
              required
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-primary sm:mt-6"
            >
              <option value="">-- Pilih Tier Badge --</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={assigning}
              className="w-full py-2.5 px-3 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{assigning ? 'Menugaskan...' : 'Tetapkan'}</span>
            </button>
          </div>
        </form>

        {/* Tabel Ringkasan User & Badge Terkini */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-theme-text">
            <thead className="bg-theme-bg text-theme-muted uppercase text-[10px] font-black border-b border-theme-border">
              <tr>
                <th className="py-2.5 px-3">Nama Pengguna</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Badge Aktif</th>
                <th className="py-2.5 px-3 text-right">Order Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {users.filter(u => u.role !== 'ADMIN').slice(0, 8).map((u) => (
                <tr key={u.id} className="hover:bg-theme-bg/50">
                  <td className="py-2 px-3 font-semibold text-theme-text">
                    {u.name}
                    <span className="block text-[10px] text-theme-muted font-normal">{u.email}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-theme-bg border border-theme-border text-theme-muted">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {u.badge_id ? (
                      <TierBadge badge={badges.find(b => b.id === u.badge_id)} size="sm" />
                    ) : (
                      <span className="text-[10px] text-theme-muted italic">Tier Standar</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-theme-text">
                    {u.successful_orders_count || 0}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
