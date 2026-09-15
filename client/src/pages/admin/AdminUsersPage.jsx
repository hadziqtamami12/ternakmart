// AdminUsersPage.jsx - Full User & Store Verification Management for Super Admin
import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Store,
  Truck,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  Clock,
  ExternalLink,
  MapPin,
  Check,
  Ban,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import { notifyAdminSuccess, notifyAdminError } from '../../utils/adminAlert';
import TierBadge from '../../components/common/TierBadge';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACTIVE'

  // User Form Inline State (No Modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    role: 'BUYER'
  });

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const res = await api.get('/stores');
      if (res.success && res.data) {
        setStores(res.data);
      }
    } catch (err) {
      console.warn('Error loading stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      phone_number: '',
      address: '',
      role: 'BUYER'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      role: user.role || 'BUYER'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
          role: formData.role
        };
        if (formData.password && formData.password.trim()) {
          payload.password = formData.password.trim();
        }
        const res = await api.put(`/auth/users/${editingUser.id}`, payload);
        if (res.success) {
          notifyAdminSuccess(`Data pengguna '${formData.name}' berhasil diperbarui!`);
          setSuccessMsg(`✓ Data pengguna '${formData.name}' berhasil diperbarui!`);
          setIsFormOpen(false);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const res = await api.post('/auth/users', formData);
        if (res.success) {
          notifyAdminSuccess(`Pengguna baru '${formData.name}' berhasil ditambahkan!`);
          setSuccessMsg(`✓ Pengguna baru '${formData.name}' berhasil ditambahkan!`);
          setIsFormOpen(false);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menyimpan data pengguna.');
      setFormError(err.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/auth/users/${userId}`, { role: newRole });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        notifyAdminSuccess(`Level peran pengguna berhasil diubah ke '${newRole}'!`);
        setSuccessMsg(`✓ Level pengguna berhasil diubah ke '${newRole}'!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal mengubah level peran.');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus pengguna '${user.name}' (@${user.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      const res = await api.delete(`/auth/users/${user.id}`);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        notifyAdminSuccess(`Pengguna '${user.name}' berhasil dihapus.`);
        setSuccessMsg(`✓ Pengguna '${user.name}' berhasil dihapus.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menghapus pengguna.');
    }
  };

  // Store verification action
  const handleUpdateStoreStatus = async (storeId, newStatus) => {
    const actionText = newStatus === 'ACTIVE' ? 'menyetujui & memverifikasi' : 'menonaktifkan';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} toko kandang ini?`)) {
      return;
    }
    try {
      const res = await api.put(`/stores/${storeId}/status`, { status: newStatus });
      if (res.success) {
        notifyAdminSuccess(`Toko berhasil ${newStatus === 'ACTIVE' ? 'diverifikasi aktif' : 'diubah statusnya'}!`);
        setSuccessMsg(`✓ Toko berhasil ${newStatus === 'ACTIVE' ? 'diverifikasi aktif' : 'diubah statusnya'}!`);
        fetchStores();
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        notifyAdminError(res.message || 'Gagal memperbarui status toko.');
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal memperbarui status toko.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return null;
      case 'SELLER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Store className="w-3 h-3" /> MITRA PETERNAK
          </span>
        );
      case 'COURIER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Truck className="w-3 h-3" /> KURIR ARMADA
          </span>
        );
      case 'BUYER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <User className="w-3 h-3" /> PEMBELI / BUYER
          </span>
        );
    }
  };

  // Filter data by role
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  // Filter stores
  const filteredStores = stores.filter(s => {
    if (storeFilter === 'PENDING') return s.status === 'PENDING' || !s.is_verified;
    if (storeFilter === 'ACTIVE') return s.status === 'ACTIVE' && s.is_verified;
    return true;
  });

  const pendingStoresCount = stores.filter(s => !s.is_verified || s.status === 'PENDING').length;

  const userColumns = [
    {
      header: 'Pengguna',
      accessor: 'name',
      render: (u) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
            alt={u.name}
            className="w-8 h-8 rounded-lg object-cover border border-theme-border flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-theme-text block truncate">{u.name}</span>
            <span className="text-[10px] text-theme-muted font-mono">@{u.username}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Kontak',
      accessor: 'email',
      render: (u) => (
        <div className="min-w-0">
          <span className="text-theme-text block truncate font-mono text-[11px]">{u.email}</span>
          <span className="text-[10px] text-theme-muted">{u.phone_number || '-'}</span>
        </div>
      )
    },
    {
      header: 'Level / Peran',
      accessor: 'role',
      mobileHeaderBadge: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          {u.role !== 'ADMIN' ? getRoleBadge(u.role) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-theme-bg border border-theme-border text-theme-muted">
              ADMIN
            </span>
          )}
          <select
            value={u.role}
            onChange={(e) => handleQuickRoleChange(u.id, e.target.value)}
            className="bg-theme-bg border border-theme-border rounded-lg px-1.5 py-0.5 text-[10px] text-theme-text focus:outline-none focus:border-theme-primary font-bold cursor-pointer"
            title="Ubah Level Peran Cepat"
          >
            <option value="BUYER">BUYER</option>
            <option value="SELLER">SELLER</option>
            <option value="COURIER">COURIER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      )
    },
    {
      header: 'Alamat Domisili',
      accessor: 'address',
      render: (u) => (
        <span className="text-[11px] text-theme-muted line-clamp-1 max-w-[200px]" title={u.address}>
          {u.address || 'Belum diatur'}
        </span>
      )
    },
    {
      header: 'Aksi Admin',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(u)}
            className="p-1.5 rounded-lg bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
            title="Edit Pengguna"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(u)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
            title="Hapus Pengguna"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const storeColumns = [
    {
      header: 'Toko Kandang',
      accessor: 'store_name',
      render: (s) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={s.logo_url || s.farm_photo_url || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=120'}
            alt={s.store_name}
            className="w-9 h-9 rounded-xl object-cover border border-theme-border flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-theme-text block truncate">{s.store_name}</span>
            <span className="text-[10px] text-theme-muted font-mono">Tier: {s.tier || 'BRONZE'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Lokasi & Tikor',
      accessor: 'farm_address',
      render: (s) => (
        <div className="min-w-0 max-w-[200px]">
          <span className="text-theme-text block truncate text-xs">{s.farm_address || 'Belum ada alamat'}</span>
          {s.latitude && s.longitude ? (
            <span className="text-[10px] text-theme-primary font-mono">
              GPS: {Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}
            </span>
          ) : (
            <span className="text-[10px] text-amber-500">Tikor belum ada</span>
          )}
        </div>
      )
    },
    {
      header: 'Legalitas (NIB/SKU)',
      accessor: 'nib_sku_number',
      render: (s) => (
        <span className="font-mono text-xs text-theme-text">
          {s.nib_sku_number || <span className="text-theme-muted text-[10px]">-</span>}
        </span>
      )
    },
    {
      header: 'Status Verifikasi',
      accessor: 'is_verified',
      render: (s) => {
        const isApproved = s.is_verified && s.status === 'ACTIVE';
        return isApproved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> TERVERIFIKASI
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 animate-pulse" /> MENUNGGU APPROVAL
          </span>
        );
      }
    },
    {
      header: 'Aksi Verifikasi',
      align: 'right',
      render: (s) => {
        const isApproved = s.is_verified && s.status === 'ACTIVE';
        return (
          <div className="flex items-center justify-end gap-2">
            {!isApproved ? (
              <button
                type="button"
                onClick={() => handleUpdateStoreStatus(s.id, 'ACTIVE')}
                className="px-3 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-[11px] font-black flex items-center gap-1 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verifikasi Toko</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUpdateStoreStatus(s.id, 'SUSPENDED')}
                className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Nonaktifkan Toko"
              >
                <Ban className="w-3 h-3" />
                <span>Suspend</span>
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-theme-primary" />
            <span>Manajemen Pengguna & Verifikasi Mitra</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Kelola akun pembeli, mitra peternak, kurir, dan setujui pengajuan toko kandang baru.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isFormOpen && (
            <>
              <button
                onClick={() => { fetchUsers(); fetchStores(); }}
                className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading || storesLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {activeTab === 'users' && (
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pengguna</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DEDICATED INLINE FORM (NO MODAL / POPUP) */}
      {isFormOpen ? (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-theme-border pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
                title="Kembali ke Daftar Pengguna"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-extrabold text-theme-text flex items-center gap-2">
                  <Users className="w-5 h-5 text-theme-primary" />
                  <span>{editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</span>
                </h2>
                <p className="text-xs text-theme-muted mt-0.5">
                  Lengkapi data akun dan hak akses pengguna di bawah ini tanpa popup.
                </p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ahmad_fauzi"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text disabled:opacity-50 focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@ternakmart.com"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">
                  {editingUser ? 'Password (Kosongkan jika tak diubah)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Min 6 karakter'}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="08123456789"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Level Peran (Role) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary font-bold"
                >
                  <option value="BUYER">BUYER (Pembeli)</option>
                  <option value="SELLER">SELLER (Mitra Peternak)</option>
                  <option value="COURIER">COURIER (Kurir Armada Mandiri)</option>
                  <option value="ADMIN">ADMIN (Super Administrator)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Alamat Domisili</label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Peternakan Sejahtera No. 12, Bogor..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:border-theme-primary resize-none"
              />
            </div>

            <div className="pt-4 border-t border-theme-border flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                {saving ? 'Menyimpan...' : editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Main Tab Navigation */}
          <div className="flex items-center gap-3 border-b border-theme-border pb-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'bg-theme-primary text-white shadow-sm'
                  : 'bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Semua Pengguna ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative ${
                activeTab === 'stores'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Verifikasi Toko Mitra ({stores.length})</span>
              {pendingStoresCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-theme-card">
                  {pendingStoresCount}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: USERS DATA TABLE */}
          {activeTab === 'users' && (
            <DataTable
              columns={userColumns}
              data={filteredUsers}
              loading={loading}
              searchPlaceholder="Cari nama, username, email, no HP..."
              searchKeys={['name', 'username', 'email', 'phone_number', 'address', 'role']}
              emptyMessage="Tidak ada pengguna yang sesuai kriteria pencarian."
              filterSlot={(
                <div className="flex items-center gap-2">
                  <span className="text-xs text-theme-muted font-bold whitespace-nowrap">Level Pengguna:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-theme-card border border-theme-border rounded-xl px-3 py-1.5 text-xs text-theme-text font-bold focus:outline-none focus:border-theme-primary cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Semua Level</option>
                    <option value="ADMIN">Super Admin</option>
                    <option value="SELLER">Peternak (Seller)</option>
                    <option value="COURIER">Kurir (Courier)</option>
                    <option value="BUYER">Pembeli (Buyer)</option>
                  </select>
                </div>
              )}
            />
          )}

          {/* TAB 2: STORES VERIFICATION TABLE */}
          {activeTab === 'stores' && (
            <DataTable
              columns={storeColumns}
              data={filteredStores}
              loading={storesLoading}
              searchPlaceholder="Cari nama toko, alamat, NIB..."
              searchKeys={['store_name', 'farm_address', 'nib_sku_number', 'status']}
              emptyMessage="Tidak ada toko yang sesuai kriteria pencarian."
              filterSlot={(
                <div className="flex items-center gap-2">
                  <span className="text-xs text-theme-muted font-bold whitespace-nowrap">Filter Status:</span>
                  <select
                    value={storeFilter}
                    onChange={(e) => setStoreFilter(e.target.value)}
                    className="bg-theme-card border border-theme-border rounded-xl px-3 py-1.5 text-xs text-theme-text font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Semua Toko ({stores.length})</option>
                    <option value="PENDING">Menunggu Approval ({pendingStoresCount})</option>
                    <option value="ACTIVE">Terverifikasi Aktif</option>
                  </select>
                </div>
              )}
            />
          )}
        </>
      )}
    </div>
  );
}
