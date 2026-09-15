// AdminMarketingPage.jsx - Hero Banner Customizer, Promo Discounts & Reviews/Stars Manager
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Image,
  Type,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  ShieldCheck,
  Save,
  Tag,
  Percent,
  Eye
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAppConfig } from '../../context/AppConfigContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import PromoEventModal from '../../components/common/PromoEventModal';
import { notifyAdminSuccess, notifyAdminError } from '../../utils/adminAlert';

export default function AdminMarketingPage() {
  const { config, updatePlatformConfig, setDocumentTitle } = useAppConfig();

  // Active section tab: 'popup' | 'reviews'
  const [activeTab, setActiveTab] = useState('popup');

  // Promo Event Modal Popup State
  const [promoModalEnabled, setPromoModalEnabled] = useState(config?.promo_modal_enabled ?? true);
  const [promoModalTitle, setPromoModalTitle] = useState(config?.promo_modal_title || 'Festival Qurban Akbar 1447H!');
  const [promoModalBadge, setPromoModalBadge] = useState(config?.promo_modal_badge || 'DISKON HINGGA 15%');
  const [promoModalSubtitle, setPromoModalSubtitle] = useState(config?.promo_modal_subtitle || 'Gunakan kupon khusus untuk mendapatkan potongan harga ternak dan gratis ongkos kirim ke seluruh Jabodetabek & Bandung!');
  const [promoModalCode, setPromoModalCode] = useState(config?.promo_modal_code || 'QURBANBERKAH');
  const [promoModalImage, setPromoModalImage] = useState(config?.promo_modal_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80');
  const [promoModalCtaText, setPromoModalCtaText] = useState(config?.promo_modal_cta_text || 'Serbu Promo Sekarang');
  const [promoModalDiscountType, setPromoModalDiscountType] = useState(config?.promo_modal_discount_type || 'PERCENT');
  const [promoModalDiscountValue, setPromoModalDiscountValue] = useState(config?.promo_modal_discount_value !== undefined ? config.promo_modal_discount_value : 15);
  const [promoModalMaxCap, setPromoModalMaxCap] = useState(config?.promo_modal_max_cap !== undefined ? config.promo_modal_max_cap : 1500000);
  const [promoModalMinPurchase, setPromoModalMinPurchase] = useState(config?.promo_modal_min_purchase || 0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Reviews State & Inline Form (No Modal)
  const [reviews, setReviews] = useState([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    rating: 5,
    weight_match_rating: 5,
    comment: '',
    animal_id: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setDocumentTitle('Manajemen Marketing & Ulasan Bintang');
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const reviewRes = await api.get('/reviews');
      if (reviewRes.success && reviewRes.data) {
        setReviews(reviewRes.data);
      }
    } catch (err) {
      console.warn('Fetch marketing data error:', err);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/reviews/admin', reviewForm);
      if (res.success) {
        setIsReviewFormOpen(false);
        setReviewForm({ user_name: '', rating: 5, weight_match_rating: 5, comment: '', animal_id: '' });
        notifyAdminSuccess('Ulasan pembeli berhasil ditambahkan!');
        setSuccessMsg('✓ Ulasan pembeli berhasil ditambahkan!');
        fetchInitialData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menambahkan ulasan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Hapus ulasan pembeli ini?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
        notifyAdminSuccess('Ulasan berhasil dihapus.');
        setSuccessMsg('✓ Ulasan berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menghapus ulasan.');
    }
  };

  const handleSavePromoModal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const codeUpper = (promoModalCode || 'QURBANBERKAH').trim().toUpperCase();

      await updatePlatformConfig({
        promo_modal_enabled: promoModalEnabled,
        promo_modal_title: promoModalTitle,
        promo_modal_badge: promoModalBadge,
        promo_modal_subtitle: promoModalSubtitle,
        promo_modal_code: codeUpper,
        promo_modal_image: promoModalImage,
        promo_modal_cta_text: promoModalCtaText,
        promo_modal_discount_type: promoModalDiscountType,
        promo_modal_discount_value: parseFloat(promoModalDiscountValue || 0),
        promo_modal_max_cap: promoModalDiscountType === 'PERCENT' ? (promoModalMaxCap ? parseFloat(promoModalMaxCap) : null) : null,
        promo_modal_min_purchase: parseFloat(promoModalMinPurchase || 0)
      });

      // Synchronize directly with backend vouchers table so buyers can actually use this discount!
      if (codeUpper) {
        try {
          await api.post('/vouchers', {
            voucher_code: codeUpper,
            discount_type: promoModalDiscountType,
            discount_value: parseFloat(promoModalDiscountValue || 0),
            min_purchase: parseFloat(promoModalMinPurchase || 0),
            max_discount_cap: promoModalDiscountType === 'PERCENT' ? (promoModalMaxCap ? parseFloat(promoModalMaxCap) : null) : null,
            is_shipping_subsidy: false,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            quota: 1000
          });
        } catch (syncErr) {
          console.warn('Voucher sync note:', syncErr.message);
        }
      }

      notifyAdminSuccess('Pengaturan Popup Banner Promo & Besaran Diskon Kupon berhasil disimpan!');
      setSuccessMsg('✓ Pengaturan Popup Modal Promo & Nilai Diskon berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      notifyAdminError(err.message || 'Gagal menyimpan pengaturan modal promo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-theme-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-theme-primary" />
            <span>Kustomisasi Marketing & Ulasan Bintang</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Atur popup event promo beranda dan moderasi ulasan rating bintang kepuasan pembeli.
          </p>
        </div>

        {successMsg && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-theme-border pb-3">
        <button
          onClick={() => setActiveTab('popup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'popup' ? 'bg-theme-primary text-theme-primary-contrast shadow-md' : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Popup Event Promo Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reviews' ? 'bg-theme-primary text-theme-primary-contrast shadow-md' : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
          }`}
        >
          <Star className="w-4 h-4 text-yellow-500" />
          <span>Ulasan & Rating Bintang</span>
        </button>
      </div>

      {/* TAB: REVIEWS & STARS (1-5) */}
      {activeTab === 'reviews' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
            <div>
              <h2 className="text-base font-extrabold text-theme-text flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Manajemen Ulasan & Rating Bintang Pembeli</span>
              </h2>
              <p className="text-xs text-theme-muted mt-0.5">
                Kelola penilaian bintang (1-5), kesesuaian bobot timbangan, dan testimoni kepuasan pembeli yang tampil di halaman depan.
              </p>
            </div>

            {!isReviewFormOpen && (
              <button
                onClick={() => setIsReviewFormOpen(true)}
                className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ulasan Baru</span>
              </button>
            )}
          </div>

          {/* Inline Form: Tambah Ulasan Baru (No Modal) */}
          {isReviewFormOpen && (
            <div className="p-6 rounded-2xl bg-theme-bg border border-theme-border space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <h3 className="font-extrabold text-sm text-theme-text flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Formulir Ulasan Pembeli Baru</span>
                </h3>
                <button
                  onClick={() => setIsReviewFormOpen(false)}
                  className="text-theme-muted hover:text-theme-text font-bold text-xs"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-theme-text block mb-1.5">Nama Pembeli *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Ahmad Zaki, S.T."
                    value={reviewForm.user_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                    className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-theme-text block mb-1.5">Rating Bintang (1 - 5)</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                      className="w-full bg-theme-card border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary cursor-pointer font-bold"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sempurna)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Bintang - Sangat Bagus)</option>
                      <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-theme-text block mb-1.5">Kesesuaian Bobot Riil</label>
                    <select
                      value={reviewForm.weight_match_rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, weight_match_rating: parseInt(e.target.value, 10) })}
                      className="w-full bg-theme-card border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary cursor-pointer font-bold"
                    >
                      <option value={5}>5/5 (Timbangan Sangat Pas & Sesuai)</option>
                      <option value={4}>4/5 (Selisih Wajar Transpor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-theme-text block mb-1.5">Komentar & Testimoni *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan kepuasan mengenai kesehatan hewan, bobot riil timbangan, dan ketepatan armada..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-theme-card border border-theme-border rounded-xl p-3.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-theme-border">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-theme-card hover:bg-theme-bg text-theme-muted hover:text-theme-text text-xs font-bold border border-theme-border transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                  >
                    {saving ? 'Menyimpan...' : 'Terbitkan Ulasan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-theme-text">
              <thead className="bg-theme-bg text-theme-muted uppercase text-[10px] font-black tracking-wider border-b border-theme-border">
                <tr>
                  <th className="py-3 px-4">Nama Pembeli</th>
                  <th className="py-3 px-4">Hewan Ternak</th>
                  <th className="py-3 px-4">Rating Bintang</th>
                  <th className="py-3 px-4">Akurasi Bobot</th>
                  <th className="py-3 px-4">Komentar / Ulasan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-theme-muted">
                      Belum ada data ulasan. Klik Tambah Ulasan Baru untuk mengisi testimoni.
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-theme-bg/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-theme-text">
                        {rev.user_name_override || rev.user_name || 'Pembeli Terverifikasi'}
                      </td>
                      <td className="py-3.5 px-4 text-theme-muted">
                        {rev.animal_title || 'Sapi Simental Super'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex text-amber-500 items-center gap-1">
                          {'★'.repeat(rev.rating || 5)}
                          <span className="text-[10px] text-theme-muted ml-1">({rev.rating}/5)</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {rev.weight_match_rating || 5}/5 Pas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-theme-text">
                        {rev.comment}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Ulasan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROMO POPUP MODAL */}
      {activeTab === 'popup' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-xs">
          <div className="border-b border-theme-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-theme-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-theme-primary" />
                <span>Pengaturan Popup Banner Promo / Event Beranda</span>
              </h2>
              <p className="text-theme-muted mt-0.5">
                Modal promosi ini otomatis muncul pada pengunjung beranda (1 kali per sesi) untuk mendongkrak konversi pembelian.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 rounded-xl bg-theme-primary hover:brightness-110 text-theme-primary-contrast font-extrabold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Pratinjau / Preview Modal</span>
            </button>
          </div>

          <form onSubmit={handleSavePromoModal} className="space-y-5">
            {/* Active Toggle Switch */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-between">
              <div>
                <span className="font-bold text-theme-text block">Status Popup Promo</span>
                <span className="text-[11px] text-theme-muted">
                  {promoModalEnabled ? 'Aktif — Modal akan muncul otomatis di halaman beranda' : 'Nonaktif — Modal tidak akan ditampilkan'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPromoModalEnabled(!promoModalEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  promoModalEnabled ? 'bg-emerald-500 justify-end' : 'bg-theme-border justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
              </button>
            </div>

            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-theme-text block mb-1">Judul Event Promo *</label>
                <input
                  type="text"
                  required
                  value={promoModalTitle}
                  onChange={(e) => setPromoModalTitle(e.target.value)}
                  placeholder="Festival Qurban Akbar 1447H!"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Badge Penawaran</label>
                <input
                  type="text"
                  value={promoModalBadge}
                  onChange={(e) => setPromoModalBadge(e.target.value)}
                  placeholder="DISKON HINGGA 15%"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>

            {/* Subtitle / Description */}
            <div>
              <label className="font-bold text-theme-text block mb-1">Deskripsi & Syarat Ketentuan Singkat</label>
              <textarea
                rows={2}
                value={promoModalSubtitle}
                onChange={(e) => setPromoModalSubtitle(e.target.value)}
                placeholder="Gunakan kupon khusus untuk mendapatkan potongan harga ternak..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:border-theme-primary leading-relaxed"
              />
            </div>

            {/* Banner Image URL */}
            <div>
              <label className="font-bold text-theme-text block mb-1">URL Gambar Banner Promo</label>
              <input
                type="url"
                value={promoModalImage}
                onChange={(e) => setPromoModalImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
              />
              {promoModalImage && (
                <div className="mt-2 h-28 rounded-xl overflow-hidden border border-theme-border max-w-sm">
                  <img src={promoModalImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Coupon Code & CTA Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-theme-text block mb-1">Kode Kupon / Promo (Opsional)</label>
                <input
                  type="text"
                  value={promoModalCode}
                  onChange={(e) => setPromoModalCode(e.target.value.toUpperCase())}
                  placeholder="QURBANBERKAH"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text font-mono font-bold focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Teks Tombol Aksi (CTA)</label>
                <input
                  type="text"
                  value={promoModalCtaText}
                  onChange={(e) => setPromoModalCtaText(e.target.value)}
                  placeholder="Serbu Promo Sekarang"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>

            {/* Dedicated Discount Reduction Settings for Popup Coupon */}
            <div className="bg-theme-bg/60 border border-theme-border rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-theme-text text-xs uppercase tracking-wider flex items-center gap-1.5 text-theme-primary">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Besaran & Nilai Pengurangan Kupon Popup</span>
                  </h3>
                  <p className="text-[11px] text-theme-muted mt-0.5">
                    Atur nominal pasti potongan harga atau persentase diskon yang didapat saat kupon ini digunakan.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {promoModalDiscountType === 'PERCENT'
                    ? `${promoModalDiscountValue}% OFF (Maks. ${formatRupiah(promoModalMaxCap)})`
                    : `Potongan ${formatRupiah(promoModalDiscountValue)}`}
                </span>
              </div>

              {/* Discount Type Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPromoModalDiscountType('PERCENT')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    promoModalDiscountType === 'PERCENT'
                      ? 'border-theme-primary bg-theme-primary/10 text-theme-primary ring-1 ring-theme-primary font-bold'
                      : 'border-theme-border bg-theme-bg text-theme-muted hover:border-theme-border/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs font-black">Diskon Persentase (%)</span>
                  </div>
                  <p className="text-[11px] text-theme-muted mt-1 font-normal">
                    Memotong persentase dari total belanja (cth: 15% OFF dengan batas maksimal).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPromoModalDiscountType('NOMINAL')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    promoModalDiscountType === 'NOMINAL'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500 font-bold'
                      : 'border-theme-border bg-theme-bg text-theme-muted hover:border-theme-border/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-black">Potongan Nominal Rupiah (Rp)</span>
                  </div>
                  <p className="text-[11px] text-theme-muted mt-1 font-normal">
                    Pengurangan langsung bernilai tetap (cth: Potongan Rp 500.000).
                  </p>
                </button>
              </div>

              {/* Dynamic Inputs */}
              {promoModalDiscountType === 'PERCENT' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="font-bold text-theme-text block mb-1">Besaran Diskon (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={promoModalDiscountValue}
                        onChange={(e) => setPromoModalDiscountValue(Math.min(90, Math.max(1, Number(e.target.value) || 0)))}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 pr-8 text-xs text-theme-text font-bold focus:outline-none focus:border-theme-primary"
                      />
                      <span className="absolute right-3.5 top-2.5 font-bold text-theme-primary text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-theme-text block mb-1">Maksimal Batas Pengurangan (Cap Diskon Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold text-theme-muted text-xs">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        placeholder="1500000"
                        value={promoModalMaxCap || ''}
                        onChange={(e) => setPromoModalMaxCap(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-theme-text font-bold focus:outline-none focus:border-theme-primary"
                      />
                    </div>
                    <p className="text-[10px] text-theme-muted mt-0.5">Batas maksimal nominal rupiah potongan yang didapatkan.</p>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="font-bold text-theme-text block mb-1">Harga Pengurangan Kupon (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-emerald-600 text-xs">Rp</span>
                    <input
                      type="number"
                      min="10000"
                      step="50000"
                      placeholder="500000"
                      value={promoModalDiscountValue}
                      onChange={(e) => setPromoModalDiscountValue(Number(e.target.value) || 0)}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-theme-text font-black text-emerald-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-theme-muted mt-0.5">Nominal tunai yang langsung mengurangi total harga hewan ternak saat checkout.</p>
                </div>
              )}

              {/* Min Purchase Input */}
              <div className="pt-1">
                <label className="font-bold text-theme-text block mb-1">Minimal Belanja Transaksi (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-theme-muted text-xs">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    placeholder="0"
                    value={promoModalMinPurchase || ''}
                    onChange={(e) => setPromoModalMinPurchase(Number(e.target.value) || 0)}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-theme-text font-bold focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <p className="text-[10px] text-theme-muted mt-0.5">Isi 0 jika tidak ada syarat minimum belanja.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-theme-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2.5 rounded-xl border border-theme-border hover:bg-theme-bg text-theme-muted font-bold transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Test Tampilan</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-theme-primary hover:brightness-110 text-theme-primary-contrast font-extrabold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Popup'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Live Preview of Promo Modal */}
      {showPreviewModal && (
        <PromoEventModal
          forceOpen={true}
          onClosePreview={() => setShowPreviewModal(false)}
          config={{
            promo_modal_enabled: true,
            promo_modal_title: promoModalTitle,
            promo_modal_badge: promoModalBadge,
            promo_modal_subtitle: promoModalSubtitle,
            promo_modal_code: promoModalCode,
            promo_modal_image: promoModalImage,
            promo_modal_cta_text: promoModalCtaText,
            promo_modal_discount_type: promoModalDiscountType,
            promo_modal_discount_value: promoModalDiscountValue,
            promo_modal_max_cap: promoModalMaxCap,
            promo_modal_min_purchase: promoModalMinPurchase
          }}
        />
      )}
    </div>
  );
}
