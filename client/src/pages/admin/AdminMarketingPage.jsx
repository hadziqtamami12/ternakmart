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
  Percent
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAppConfig } from '../../context/AppConfigContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function AdminMarketingPage() {
  const { config, updatePlatformConfig, setDocumentTitle } = useAppConfig();

  // Active section tab: 'hero' | 'promo' | 'reviews'
  const [activeTab, setActiveTab] = useState('hero');

  // Hero Section State
  const [heroMode, setHeroMode] = useState(config?.hero_mode || 'TEXT_GRADIENT'); // 'IMAGE' | 'TEXT_GRADIENT'
  const [heroBannerImage, setHeroBannerImage] = useState(config?.hero_banner_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1600&auto=format&fit=crop&q=80');
  const [heroBadge, setHeroBadge] = useState(config?.hero_badge || 'FESTIVAL AKBAR QURBAN 1447H');
  const [heroTitle, setHeroTitle] = useState(config?.hero_title || 'Diskon Spesial Ternak Hingga Rp 1.500.000');
  const [heroSubtitle, setHeroSubtitle] = useState(config?.hero_subtitle || 'Free Titip Rawat & Pakan Konsentrat sampai H-3 Idul Adha. Bebas Ongkir Armada Khusus Jabodetabek & Bandung.');
  const [heroCta, setHeroCta] = useState(config?.hero_cta || 'Beli Ternak Qurban');

  // Promo Discounts State
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(config?.promo_discount_percent || 10);
  const [promoAnimalIds, setPromoAnimalIds] = useState(config?.promo_animal_ids || []);
  const [animals, setAnimals] = useState([]);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
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
    setDocumentTitle('Manajemen Hero, Promo & Ulasan Bintang');
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [animalRes, reviewRes] = await Promise.all([
        api.get('/animals'),
        api.get('/reviews')
      ]);
      if (animalRes.success && animalRes.data) {
        setAnimals(animalRes.data);
      }
      if (reviewRes.success && reviewRes.data) {
        setReviews(reviewRes.data);
      }
    } catch (err) {
      console.warn('Fetch marketing data error:', err);
    }
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updatePlatformConfig({
        hero_mode: heroMode,
        hero_banner_image: heroBannerImage,
        hero_badge: heroBadge,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_cta: heroCta
      });
      setSuccessMsg('✓ Pengaturan Hero Section Beranda berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pengaturan hero.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePromoAnimal = (id) => {
    if (promoAnimalIds.includes(id)) {
      setPromoAnimalIds(prev => prev.filter(x => x !== id));
    } else {
      setPromoAnimalIds(prev => [...prev, id]);
    }
  };

  const handleSavePromo = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await updatePlatformConfig({
        promo_discount_percent: parseInt(promoDiscountPercent, 10),
        promo_animal_ids: promoAnimalIds
      });
      setSuccessMsg(`✓ Pengaturan promo (${promoDiscountPercent}% pada ${promoAnimalIds.length} ternak) berhasil diterapkan ke Beranda & Katalog!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan promo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/reviews/admin', reviewForm);
      if (res.success) {
        setReviewModalOpen(false);
        setReviewForm({ user_name: '', rating: 5, weight_match_rating: 5, comment: '', animal_id: '' });
        fetchInitialData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan ulasan.');
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
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus ulasan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Kustomisasi Hero Beranda, Promo & Ulasan Bintang</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ubah teks/gambar hero section landing page, atur diskon persentase promo ternak, dan moderasi ulasan rating bintang pembeli.
          </p>
        </div>

        {successMsg && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'hero' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Hero Banner Beranda (Teks / Image)</span>
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'promo' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>Kelola Promo & Diskon (%)</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reviews' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-yellow-300" />
          <span>Ulasan & Rating Bintang</span>
        </button>
      </div>

      {/* TAB 1: HERO SECTION CONFIG */}
      {activeTab === 'hero' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <form onSubmit={handleSaveHero} className="space-y-6 text-xs">
            {/* Mode Selector */}
            <div>
              <label className="font-bold text-slate-300 block mb-2 text-sm">
                Pilih Tipe Tampilan Hero Banner Utama
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setHeroMode('TEXT_GRADIENT')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    heroMode === 'TEXT_GRADIENT'
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-400" />
                    <span>Mode Teks & Gradien Modern</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Menampilkan teks promosi elegan, badge penawaran, dan tombol CTA di atas latar belakang gradien dinamis.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setHeroMode('IMAGE_BANNER')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    heroMode === 'IMAGE_BANNER'
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Image className="w-4 h-4 text-amber-400" />
                    <span>Mode Banner Gambar (Full Image)</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Menampilkan gambar banner promosi penuh beresolusi tinggi dengan teks judul overlay yang dapat disesuaikan.
                  </p>
                </button>
              </div>
            </div>

            {/* Image URL (if using image) */}
            {heroMode === 'IMAGE_BANNER' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                <label className="font-bold text-slate-300 block">
                  URL Gambar Banner Hero (Rekomendasi rasio 16:9 atau lebar minimal 1400px)
                </label>
                <input
                  type="url"
                  required
                  value={heroBannerImage}
                  onChange={(e) => setHeroBannerImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                {heroBannerImage && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-slate-800">
                    <img src={heroBannerImage} alt="Preview Banner" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Editable Texts */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="font-extrabold text-white text-sm">Edit Tulisan & Konten Hero Section</h3>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Teks Badge Penawaran / Tag</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="Contoh: FESTIVAL AKBAR QURBAN 1447H"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Judul Utama Hero (Headline)</label>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Contoh: Diskon Spesial Ternak Hingga Rp 1.500.000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Subjudul / Deskripsi Penjelasan</label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Deskripsi promo dan jaminan layanan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Teks Tombol Aksi (CTA)</label>
                <input
                  type="text"
                  value={heroCta}
                  onChange={(e) => setHeroCta(e.target.value)}
                  placeholder="Contoh: Beli Ternak Qurban"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Terapkan ke Beranda'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PROMO & DISCOUNTS (%) */}
      {activeTab === 'promo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Pengaturan Promo Kilat & Besaran Diskon (%)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih hewan ternak mana saja yang masuk ke slot flash sale beranda dan tentukan persentase diskon potongan harganya.
            </p>
          </div>

          {/* Discount Percentage Input */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 max-w-md space-y-2">
            <label className="font-bold text-slate-300 block text-xs">
              Besaran Persentase Diskon Promo (%)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={promoDiscountPercent}
                  onChange={(e) => setPromoDiscountPercent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-black"
                />
                <Percent className="w-4 h-4 text-amber-400 absolute right-3.5 top-3" />
              </div>
              <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
                Potongan {promoDiscountPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Contoh: Sapi Rp 20.000.000 dengan diskon {promoDiscountPercent}% menjadi <strong>{formatRupiah(20000000 * (1 - promoDiscountPercent / 100))}</strong>.
            </p>
          </div>

          {/* Animal Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 block text-xs">
                Pilih Hewan Ternak yang Sedang Promo ({promoAnimalIds.length} Terpilih):
              </label>
              <button
                type="button"
                onClick={() => setPromoAnimalIds(animals.map(a => a.id))}
                className="text-[11px] text-emerald-400 hover:underline font-bold"
              >
                Pilih Semua
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {animals.map((anm) => {
                const isSelected = promoAnimalIds.includes(anm.id);
                const originalPrice = parseFloat(anm.price);
                const discounted = Math.round(originalPrice * (1 - promoDiscountPercent / 100));

                return (
                  <div
                    key={anm.id}
                    onClick={() => handleTogglePromoAnimal(anm.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-amber-500 border-slate-700 pointer-events-none"
                    />
                    <img
                      src={anm.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                      alt={anm.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white block text-xs truncate">{anm.title}</span>
                      <span className="text-[10px] text-slate-500 block">{anm.category} • {formatWeight(anm.weight_kg)}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500 line-through">{formatRupiah(originalPrice)}</span>
                        <span className="text-xs font-black text-amber-400">{formatRupiah(discounted)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleSavePromo}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menerapkan...' : 'Simpan Promo & Diskon'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEWS & STARS (1-5) */}
      {activeTab === 'reviews' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Manajemen Ulasan & Rating Bintang Pembeli</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola penilaian bintang (1-5), kesesuaian bobot timbangan, dan testimoni kepuasan pembeli yang tampil di halaman depan.
              </p>
            </div>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ulasan Baru</span>
            </button>
          </div>

          {/* Reviews Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Pembeli</th>
                  <th className="py-3 px-4">Hewan Ternak</th>
                  <th className="py-3 px-4">Rating Bintang</th>
                  <th className="py-3 px-4">Akurasi Bobot</th>
                  <th className="py-3 px-4">Komentar / Ulasan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      Belum ada data ulasan. Klik Tambah Ulasan Baru untuk mengisi testimoni.
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {rev.user_name_override || rev.user_name || 'Pembeli Terverifikasi'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {rev.animal_title || 'Sapi Simental Super'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex text-amber-400 items-center gap-1">
                          {'★'.repeat(rev.rating || 5)}
                          <span className="text-[10px] text-slate-400 ml-1">({rev.rating}/5)</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {rev.weight_match_rating || 5}/5 Pas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                        {rev.comment}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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

      {/* Modal: Tambah Ulasan Baru */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Tambah Ulasan Pembeli Baru</span>
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nama Pembeli</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Ahmad Zaki, S.T."
                  value={reviewForm.user_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Rating Bintang (1 - 5)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sempurna)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Bintang - Sangat Bagus)</option>
                    <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Kesesuaian Bobot Riil</label>
                  <select
                    value={reviewForm.weight_match_rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, weight_match_rating: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={5}>5/5 (Timbangan Sangat Pas & Sesuai)</option>
                    <option value={4}>4/5 (Selisih Wajar Transpor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Komentar & Testimoni</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan kepuasan mengenai kesehatan hewan, bobot riil timbangan, dan ketepatan armada..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                >
                  {saving ? 'Menyimpan...' : 'Terbitkan Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
