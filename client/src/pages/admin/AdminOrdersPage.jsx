// AdminOrdersPage.jsx - Order CRUD DataTable with Status Transitions, Proof Viewer & Per-Order Promo Customization
import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  ChevronDown,
  XCircle,
  ShieldCheck,
  Building2,
  ExternalLink,
  RefreshCw,
  Tag,
  Percent,
  Edit2,
  X
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { useTimezone } from '../../context/TimezoneContext';
import DataTable from '../../components/common/DataTable';

export default function AdminOrdersPage() {
  const { formatTime } = useTimezone();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProof, setSelectedProof] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Per-Order Promo State Modal
  const [promoModalOrder, setPromoModalOrder] = useState(null);
  const [adminDiscountInput, setAdminDiscountInput] = useState(0);
  const [storeDiscountInput, setStoreDiscountInput] = useState(0);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [promoNotes, setPromoNotes] = useState('');
  const [savingPromo, setSavingPromo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, notes = '') => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes || `Status diubah oleh Super Admin menjadi ${newStatus}`
      });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setSuccessMsg(`✓ Status pesanan berhasil diperbarui ke ${newStatus}!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenPromoModal = (order) => {
    setPromoModalOrder(order);
    setAdminDiscountInput(order.admin_discount || 0);
    setStoreDiscountInput(order.store_discount || 0);
    setVoucherCodeInput(order.voucher_code || '');
    setPromoNotes('');
  };

  const handleSavePromoOrder = async (e) => {
    e.preventDefault();
    if (!promoModalOrder) return;
    setSavingPromo(true);
    try {
      const res = await api.put(`/orders/${promoModalOrder.id}/discount`, {
        admin_discount: parseFloat(adminDiscountInput || 0),
        store_discount: parseFloat(storeDiscountInput || 0),
        voucher_code: voucherCodeInput.trim(),
        notes: promoNotes
      });
      if (res.success && res.data) {
        setOrders(prev => prev.map(o => o.id === promoModalOrder.id ? { ...o, ...res.data } : o));
        setSuccessMsg(`✓ Promo khusus untuk order #${promoModalOrder.invoice_number} berhasil disimpan!`);
        setPromoModalOrder(null);
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan promo order.');
    } finally {
      setSavingPromo(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">Menunggu Bayar</span>;
      case 'PAYMENT_VERIFICATION':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">Verifikasi Struk</span>;
      case 'ORDER_CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-500/10 text-teal-400 border border-teal-500/20">Dikonfirmasi</span>;
      case 'HEALTH_INSPECTION':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">Cek SKKH</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Dalam Pengantaran</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Selesai Diterima</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      header: 'Invoice & Tanggal',
      accessor: 'invoice_number',
      render: (order) => (
        <div className="font-mono min-w-0">
          <span className="font-bold text-white block truncate">{order.invoice_number}</span>
          <span className="text-[10px] text-slate-500">{formatTime(order.created_at)}</span>
        </div>
      )
    },
    {
      header: 'Pembeli',
      accessor: 'buyer.name',
      render: (order) => (
        <div className="min-w-0">
          <span className="font-bold text-slate-200 block truncate">{order.buyer?.name || 'Pembeli'}</span>
          <span className="text-[10px] text-slate-500">{order.buyer?.phone_number || '-'}</span>
        </div>
      )
    },
    {
      header: 'Hewan Ternak',
      accessor: 'animal.title',
      render: (order) => (
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={order.animal?.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
            alt={order.animal?.title}
            className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="font-bold text-slate-200 block truncate max-w-[140px]">
              {order.animal?.title || 'Hewan Ternak'}
            </span>
            <span className="text-[10px] text-slate-500">
              {order.animal?.category} • {formatWeight(order.animal?.weight_kg)}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Total & Promo Order',
      accessor: 'grand_total',
      render: (order) => {
        const totalDiscount = (parseFloat(order.store_discount || 0) + parseFloat(order.admin_discount || 0));
        return (
          <div className="min-w-0">
            <span className="font-black text-emerald-400 block">{formatRupiah(order.grand_total)}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {totalDiscount > 0 ? (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5" /> -{formatRupiah(totalDiscount)}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Tanpa promo</span>
              )}
              <button
                onClick={() => handleOpenPromoModal(order)}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline"
                title="Atur Promo Khusus Pesanan Ini"
              >
                Ubah
              </button>
            </div>
            {order.voucher_code && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded block w-max mt-0.5">
                Kupon: {order.voucher_code}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Bukti Bayar',
      accessor: 'payment_proof_url',
      render: (order) => (
        <div>
          {order.payment_proof_url ? (
            <button
              onClick={() => setSelectedProof(order.payment_proof_url)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-sky-400"
            >
              <Eye className="w-3 h-3" /> Lihat Struk
            </button>
          ) : (
            <span className="text-[10px] text-slate-500">Belum ada</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      mobileHeaderBadge: true,
      render: (order) => getStatusBadge(order.status)
    },
    {
      header: 'Aksi Status',
      align: 'right',
      render: (order) => (
        <div className="flex items-center justify-end gap-1.5">
          {order.status === 'PAYMENT_VERIFICATION' && (
            <button
              onClick={() => handleUpdateStatus(order.id, 'ORDER_CONFIRMED', 'Struk transfer pembayaran diverifikasi valid oleh Admin')}
              disabled={updatingId === order.id}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] shadow"
            >
              Setujui
            </button>
          )}

          <select
            value={order.status}
            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
            disabled={updatingId === order.id}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
            <option value="PAYMENT_VERIFICATION">PAYMENT_VERIFICATION</option>
            <option value="ORDER_CONFIRMED">ORDER_CONFIRMED</option>
            <option value="HEALTH_INSPECTION">HEALTH_INSPECTION</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
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
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Manajemen & CRUD Pesanan (DataTable)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau transaksi ternak, atur promo/diskon per order, verifikasi bukti bayar, dan kendalikan status pengiriman.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
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
        data={filteredOrders}
        loading={loading}
        searchPlaceholder="Cari no invoice, nama pembeli, hewan..."
        searchKeys={['invoice_number', 'buyer.name', 'buyer.phone_number', 'animal.title', 'voucher_code', 'status']}
        emptyMessage="Tidak ada pesanan yang sesuai kriteria pencarian."
        filterSlot={(
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'Semua Status' },
              { id: 'PAYMENT_VERIFICATION', label: 'Perlu Verifikasi' },
              { id: 'PENDING_PAYMENT', label: 'Belum Bayar' },
              { id: 'ORDER_CONFIRMED', label: 'Dikonfirmasi' },
              { id: 'IN_TRANSIT', label: 'Dikirim' },
              { id: 'COMPLETED', label: 'Selesai' },
              { id: 'CANCELLED', label: 'Batal' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
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

      {/* Proof Viewer Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-sm text-white">Bukti Transfer Pembayaran</span>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedProof}
                alt="Bukti Transfer"
                className="w-full h-auto object-contain max-h-[65vh]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Order Promo Customization Modal */}
      {promoModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span>Atur Promo Khusus Pesanan</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  Invoice: #{promoModalOrder.invoice_number}
                </span>
              </div>
              <button
                onClick={() => setPromoModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Harga Dasar Hewan:</span>
                <span className="font-bold text-white">{formatRupiah(promoModalOrder.base_price)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ongkos Kirim:</span>
                <span className="text-white">{formatRupiah(promoModalOrder.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Biaya Layanan:</span>
                <span className="text-white">{formatRupiah(promoModalOrder.service_fee)}</span>
              </div>
            </div>

            <form onSubmit={handleSavePromoOrder} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Diskon Platform / Admin (Rupiah)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={adminDiscountInput}
                  onChange={(e) => setAdminDiscountInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Diskon Toko / Peternak (Rupiah)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={storeDiscountInput}
                  onChange={(e) => setStoreDiscountInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Kode Kupon Voucher (Opsional)
                </label>
                <input
                  type="text"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: QURBANBERKAH"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Catatan Pemberian Promo
                </label>
                <textarea
                  rows={2}
                  value={promoNotes}
                  onChange={(e) => setPromoNotes(e.target.value)}
                  placeholder="Promo khusus pembelian pertama / negosiasi langsung..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPromoModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg"
                >
                  {savingPromo ? 'Menyimpan...' : 'Terapkan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
