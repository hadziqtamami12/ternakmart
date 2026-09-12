// AdminUsersPage.jsx - Full User & Role Management CRUD DataTable for Super Admin
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
  Lock
} from 'lucide-react';
import { api } from '../../utils/api';
import DataTable from '../../components/common/DataTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '', // leave blank if unchanged
      phone_number: user.phone_number || '',
      address: user.address || '',
      role: user.role || 'BUYER'
    });
    setFormError('');
    setIsModalOpen(true);
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
          setSuccessMsg(`✓ Data pengguna '${formData.name}' berhasil diperbarui!`);
          setIsModalOpen(false);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const res = await api.post('/auth/users', formData);
        if (res.success) {
          setSuccessMsg(`✓ Pengguna baru '${formData.name}' berhasil ditambahkan!`);
          setIsModalOpen(false);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
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
        setSuccessMsg(`✓ Level pengguna berhasil diubah ke '${newRole}'!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah level peran.');
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
        setSuccessMsg(`✓ Pengguna '${user.name}' berhasil dihapus.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldCheck className="w-3 h-3" /> SUPER ADMIN
          </span>
        );
      case 'SELLER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Store className="w-3 h-3" /> MITRA PETERNAK
          </span>
        );
      case 'COURIER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Truck className="w-3 h-3" /> KURIR ARMADA
          </span>
        );
      case 'BUYER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

  const columns = [
    {
      header: 'Pengguna',
      accessor: 'name',
      render: (u) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=059669&color=fff`}
            alt={u.name}
            className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-white block truncate">{u.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">@{u.username}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Kontak',
      accessor: 'email',
      render: (u) => (
        <div className="min-w-0">
          <span className="text-slate-300 block truncate font-mono text-[11px]">{u.email}</span>
          <span className="text-[10px] text-slate-500">{u.phone_number || '-'}</span>
        </div>
      )
    },
    {
      header: 'Level / Peran',
      accessor: 'role',
      mobileHeaderBadge: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          {getRoleBadge(u.role)}
          <select
            value={u.role}
            onChange={(e) => handleQuickRoleChange(u.id, e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5 text-[10px] text-slate-400 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
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
        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]" title={u.address}>
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
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Edit Pengguna"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(u)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            title="Hapus Pengguna"
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
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Kelola Pengguna & Level Role</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen akun pengguna, atur peran (Buyer, Seller, Courier, Admin), dan reset data akses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchUsers}
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
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Filter Pills Slot */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        searchPlaceholder="Cari nama, username, email, no HP..."
        searchKeys={['name', 'username', 'email', 'phone_number', 'address', 'role']}
        emptyMessage="Tidak ada pengguna yang sesuai kriteria pencarian."
        filterSlot={(
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'Semua Level' },
              { id: 'ADMIN', label: 'Admin' },
              { id: 'SELLER', label: 'Peternak' },
              { id: 'COURIER', label: 'Kurir' },
              { id: 'BUYER', label: 'Pembeli' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  roleFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      />

      {/* Modal Create / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</span>
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
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ahmad_fauzi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@ternakmart.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {editingUser ? 'Password (Kosongkan jika tak diubah)' : 'Kata Sandi *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Min 6 karakter'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="08123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Level Peran (Role) *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="BUYER">BUYER (Pembeli)</option>
                    <option value="SELLER">SELLER (Mitra Peternak)</option>
                    <option value="COURIER">COURIER (Kurir Armada Mandiri)</option>
                    <option value="ADMIN">ADMIN (Super Administrator)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Alamat Domisili</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Peternakan Sejahtera No. 12, Bogor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
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
                  {saving ? 'Menyimpan...' : editingUser ? 'Perbarui Pengguna' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
