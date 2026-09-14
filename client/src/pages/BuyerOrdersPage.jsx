// BuyerOrdersPage.jsx - Order History, Proof Upload with 5MB Validation & Review Form
import React, { useState, useEffect } from 'react';
import {
  Package,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  Star,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { useTimezone } from '../context/TimezoneContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function BuyerOrdersPage({ onNavigate, onOpenTracking }) {
  const { setDocumentTitle } = useAppConfig();
  const { formatTime } = useTimezone();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Proof Modal state
  const [activeUploadOrder, setActiveUploadOrder] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Review Modal state
  const [activeReviewOrder, setActiveReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [weightMatchRating, setWeightMatchRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setDocumentTitle('Daftar Pesanan Ternak');
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
      console.warn('Fetch orders error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    // Strict Client Validation: 5MB for images/docs
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Format file '${file.type}' tidak didukung. Harap unggah format JPG, PNG, WEBP, atau PDF.`);
      setUploadFile(null);
      setUploadPreview('');
      return;
    }

    if (file.size > maxSize) {
      setUploadError(`Ukuran file ${(file.size / (1024 * 1024)).toFixed(2)} MB melebihi batas maksimal 5 MB.`);
      setUploadFile(null);
      setUploadPreview('');
      return;
    }

    setUploadFile(file);
    if (file.type.startsWith('image/')) {
      setUploadPreview(URL.createObjectURL(file));
    } else {
      setUploadPreview('');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !activeUploadOrder) return;

    setUploading(true);
    setUploadError('');
    try {
      // 1. Upload file
      const uploadRes = await api.uploadFile(uploadFile);
      const fileUrl = uploadRes.data.url;

      // 2. Submit proof to order
      const res = await api.post('/payments/upload-proof', {
        order_id: activeUploadOrder.id,
        proof_url: fileUrl
      });

      if (res.success) {
        setActiveUploadOrder(null);
        setUploadFile(null);
        setUploadPreview('');
        await fetchOrders();
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah bukti transfer.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!activeReviewOrder) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        order_id: activeReviewOrder.id,
        rating: reviewRating,
        weight_match_rating: weightMatchRating,
        comment: reviewComment
      });

      if (res.success) {
        setActiveReviewOrder(null);
        setReviewComment('');
        await fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengirimkan ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      AWAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
      HEALTH_INSPECTION: { label: 'Inspeksi & Karantina', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' },
      DISPATCHED: { label: 'Penjemputan Armada', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
      IN_TRANSIT: { label: 'Dalam Perjalanan Truk', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
      DELIVERED: { label: 'Hewan Telah Tiba', color: 'bg-emerald-600/20 text-emerald-800 dark:text-emerald-300' },
      COMPLETED: { label: 'Pesanan Selesai', color: 'bg-emerald-600 text-white' },
      CANCELLED: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600' }
    };
    return map[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      <div className="border-b border-theme-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text tracking-tight">
            Riwayat Pesanan Ternak
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
            Pantau status verifikasi pembayaran, karantina, dan live tracking armada kurir
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-theme-card border border-theme-border rounded-3xl animate-pulse" />
          <div className="h-40 bg-theme-card border border-theme-border rounded-3xl animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-theme-card border border-theme-border rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-theme-primary-light text-theme-primary flex items-center justify-center mx-auto text-2xl">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-theme-text">Belum Ada Pesanan Aktif</h2>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            Semua transaksi hewan ternak Anda akan tercatat di sini lengkap dengan live tracking GPS dan mutasi pembayaran.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover"
          >
            Beli Hewan Ternak Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-sm space-y-5 transition-all hover:border-theme-border/80"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-border pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-theme-text">{order.invoice_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-theme-muted">
                      Waktu Order: {formatTime(order.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-theme-muted block">Total Biaya Transparan:</span>
                    <span className="text-base font-black text-theme-primary">
                      {formatRupiah(order.grand_total)}
                    </span>
                  </div>
                </div>

                {/* Animal Preview & Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={(order.animal?.images && order.animal.images[0]) || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'}
                      alt="Ternak"
                      className="w-20 h-20 rounded-2xl object-cover border border-theme-border flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-theme-text">{order.animal?.title || 'Hewan Ternak'}</h3>
                      <p className="text-xs text-theme-muted">
                        Kandang: <strong>{order.store?.store_name || 'Peternakan'}</strong>
                      </p>
                      <p className="text-[11px] text-theme-muted">
                        Tujuan: {order.delivery_address}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                    {/* Live Tracking Button */}
                    {['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(order.status) && (
                      <button
                        onClick={() => onOpenTracking(order.id)}
                        className="px-4 py-2 rounded-xl bg-theme-primary-light text-theme-primary text-xs font-bold hover:bg-theme-primary hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Live Map Tracking
                      </button>
                    )}

                    {/* Upload Transfer Proof Button */}
                    {order.payment_status === 'UNPAID' && (
                      <button
                        onClick={() => setActiveUploadOrder(order)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Bukti Transfer
                      </button>
                    )}

                    {order.payment_status === 'AWAITING_APPROVAL' && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Bukti Menunggu Approval
                      </span>
                    )}

                    {/* Review Button for Delivered Orders */}
                    {order.status === 'DELIVERED' && !order.review && (
                      <button
                        onClick={() => setActiveReviewOrder(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Beri Ulasan Bobot
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Proof Modal with Strict 5MB Validation */}
      {activeUploadOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-theme-text">Unggah Bukti Struk Transfer</h3>
                <p className="text-[11px] text-theme-muted">Invoice: {activeUploadOrder.invoice_number}</p>
              </div>
              <button onClick={() => setActiveUploadOrder(null)} className="text-theme-muted hover:text-theme-text font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-theme-bg border border-theme-border space-y-1">
                <span className="text-theme-muted text-[11px] block">Nominal yang wajib ditransfer:</span>
                <span className="text-lg font-black text-theme-primary">
                  {formatRupiah(activeUploadOrder.grand_total)}
                </span>
                <p className="text-[10px] text-theme-muted">
                  BCA 8830192841 a/n PT TERNAKMART INDONESIA
                </p>
              </div>

              {/* Upload Input */}
              <div className="space-y-2">
                <label className="font-bold text-theme-text block">
                  Pilih Berkas Struk (Maksimal 5 MB - JPG, PNG, WEBP, PDF)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5 text-xs text-theme-text file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-theme-primary file:text-white"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadPreview && (
                <div className="rounded-2xl overflow-hidden border border-theme-border max-h-48 flex justify-center bg-slate-100 dark:bg-slate-800">
                  <img src={uploadPreview} alt="Pratinjau Struk" className="object-contain h-48" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveUploadOrder(null)}
                  className="px-4 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold hover:bg-theme-border/50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile || uploading}
                  className="px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-md"
                >
                  {uploading ? 'Mengunggah & Memvalidasi...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal with 1-5 Weight Match Rating */}
      {activeReviewOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-extrabold text-theme-text">Ulasan & Kesesuaian Bobot Riil</h3>
              <button onClick={() => setActiveReviewOrder(null)} className="text-theme-muted hover:text-theme-text font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-theme-muted">
                Ternak: <strong>{activeReviewOrder.animal?.title}</strong> dari {activeReviewOrder.store?.store_name}
              </p>

              {/* Overall Star Rating */}
              <div className="space-y-1.5">
                <label className="font-bold text-theme-text block">Penilaian Keseluruhan (Kondisi Fisik & Sehat)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform ${star <= reviewRating ? 'text-amber-400 scale-110' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="font-bold text-theme-text ml-2">{reviewRating} / 5 Bintang</span>
                </div>
              </div>

              {/* Weight Match Rating 1-5 */}
              <div className="space-y-1.5 pt-2 border-t border-theme-border">
                <label className="font-bold text-theme-text block">
                  Kesesuaian Timbangan Bobot Riil (Klaim: {formatWeight(activeReviewOrder.animal?.weight_kg)})
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setWeightMatchRating(score)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        weightMatchRating === score
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-theme-bg text-theme-text border-theme-border'
                      }`}
                    >
                      {score} {score === 5 ? '(Sangat Akurat)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1.5 pt-2 border-t border-theme-border">
                <label className="font-bold text-theme-text block">Komentar & Testimoni Pelayanan</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda mengenai kondisi fisik hewan hidup, armada kurir, dan akurasi bobot..."
                  className="w-full bg-theme-bg border border-theme-border rounded-2xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveReviewOrder(null)}
                  className="px-4 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold hover:bg-theme-border/50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-md"
                >
                  {submittingReview ? 'Menyimpan...' : 'Kirim Ulasan Resmi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
