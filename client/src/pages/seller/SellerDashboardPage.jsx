// SellerDashboardPage.jsx - Multi-Vendor Store Dashboard & Payment Approval
import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useTimezone } from '../../context/TimezoneContext';
import { useAppConfig } from '../../context/AppConfigContext';

export default function SellerDashboardPage({ onNavigate, onEditLivestock }) {
  const { setDocumentTitle } = useAppConfig();
  const { user } = useAuth();
  const { formatTime } = useTimezone();

  const [store, setStore] = useState(user?.store || null);
  const [orders, setOrders] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Payment Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    setDocumentTitle('Kandang Peternak');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch store
      const userRes = await api.get('/auth/me');
      if (userRes.success && userRes.data?.store) {
        setStore(userRes.data.store);
        // Fetch store animals
        const animalRes = await api.get(`/animals?store_id=${userRes.data.store.id}`);
        if (animalRes.success && animalRes.data) {
          setAnimals(animalRes.data);
        }
      }

      // Fetch seller orders
      const orderRes = await api.get('/orders');
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.warn('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedOrder) return;
    setReviewing(true);
    try {
      const res = await api.post('/payments/review-proof', {
        order_id: selectedOrder.id,
        decision: reviewDecision,
        notes: reviewNotes
      });

      if (res.success) {
        setSelectedOrder(null);
        setReviewNotes('');
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mereview bukti transfer.');
    } finally {
      setReviewing(false);
    }
  };

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-theme-primary mx-auto" />
        <h2 className="text-xl font-extrabold text-theme-text">Pendaftaran Kandang Peternakan</h2>
        <p className="text-xs text-theme-muted">
          Anda belum mendaftarkan fasilitas peternakan/kandang. Daftarkan kandang Anda untuk mulai menjual hewan ternak.
        </p>
        <button
          onClick={() => onNavigate('register-store')}
          className="px-5 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-xl"
        >
          Daftarkan Kandang Peternak
        </button>
      </div>
    );
  }

  const awaitingApprovalOrders = orders.filter(o => o.payment_status === 'AWAITING_APPROVAL');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Farm Profile Header Card */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={store.farm_photo_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80'}
            alt={store.store_name}
            className="w-16 h-16 rounded-2xl object-cover border border-theme-border flex-shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-theme-text">{store.store_name}</h1>
              <span className="bg-emerald-500/10 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
                Tier {store.tier}
              </span>
              <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {store.status}
              </span>
            </div>
            <p className="text-xs text-theme-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {store.farm_address}
            </p>
            <p className="text-[11px] text-theme-muted">NIB/Legalitas: {store.nib_sku_number || 'Dalam Verifikasi'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('manage-livestock')}
            className="px-4 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Ternak Baru
          </button>
        </div>
      </div>

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
          <span className="text-xs text-theme-muted block font-medium">Ternak di Katalog</span>
          <span className="text-2xl font-black text-theme-text mt-1 block">{animals.length} Ekor</span>
        </div>
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
          <span className="text-xs text-theme-muted block font-medium">Total Pesanan Masuk</span>
          <span className="text-2xl font-black text-theme-text mt-1 block">{orders.length} Order</span>
        </div>
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
          <span className="text-xs text-theme-muted block font-medium">Menunggu Verifikasi Bayar</span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">{awaitingApprovalOrders.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
          <span className="text-xs text-theme-muted block font-medium">Skor Rating Peternak</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">★ {store.rating_average || 5.0}</span>
        </div>
      </div>

      {/* Orders Awaiting Payment Proof Approval Section */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <h2 className="text-sm font-extrabold text-theme-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Verifikasi Pembayaran Manual Masuk
          </h2>
          <span className="text-xs text-theme-muted">{awaitingApprovalOrders.length} Pesanan</span>
        </div>

        {awaitingApprovalOrders.length === 0 ? (
          <p className="text-xs text-theme-muted text-center py-6">
            Tidak ada bukti transfer yang menunggu persetujuan saat ini.
          </p>
        ) : (
          <div className="divide-y divide-theme-border/60">
            {awaitingApprovalOrders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-theme-text">{order.invoice_number}</span>
                    <span className="text-xs font-extrabold text-theme-primary">{formatRupiah(order.grand_total)}</span>
                  </div>
                  <p className="text-xs text-theme-muted">
                    Pembeli: <strong>{order.buyer?.name || 'Konsumen'}</strong> ({order.buyer?.phone_number || '-'})
                  </p>
                  <p className="text-[11px] text-theme-muted">
                    Waktu Upload: {formatTime(order.updated_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {order.payment_proof_url && (
                    <a
                      href={order.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold text-theme-text hover:bg-theme-border/50 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat Struk
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setReviewDecision('APPROVE');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    Validasi Mutasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-extrabold text-theme-text">Validasi Struk & Mutasi Bank</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-theme-muted hover:text-theme-text font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-theme-bg border border-theme-border space-y-1">
                <p className="text-theme-muted">Invoice: <strong>{selectedOrder.invoice_number}</strong></p>
                <p className="text-theme-muted">Total Pembayaran: <strong className="text-theme-primary">{formatRupiah(selectedOrder.grand_total)}</strong></p>
                <p className="text-theme-muted">Pembeli: {selectedOrder.buyer?.name}</p>
              </div>

              {selectedOrder.payment_proof_url && (
                <div className="rounded-2xl overflow-hidden border border-theme-border max-h-56 flex justify-center bg-slate-100 dark:bg-slate-900">
                  <img src={selectedOrder.payment_proof_url} alt="Struk Transfer" className="object-contain h-56" />
                </div>
              )}

              {/* Decision */}
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text block">Keputusan Validasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-theme-bg text-theme-text border-theme-border'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve (Dana Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'REJECT'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-theme-bg text-theme-text border-theme-border'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Tolak (Tidak Sah)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-theme-text block">Catatan / Alasan untuk Pembeli</label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Contoh: Dana telah mutasi di rekening BCA Barokah Farm."
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewing}
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover transition-colors shadow-md"
                >
                  {reviewing ? 'Memproses...' : 'Simpan Keputusan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
