// AnimalDetailPage.jsx - Detail Ternak, Video Player, SKKH Preview & Nego Chat Button
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Truck,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Store,
  FileText,
  Play,
  MapPin,
  Clock,
  Plus,
  Minus
} from 'lucide-react';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function AnimalDetailPage({ animal, onBack, onNavigate, onStartChat }) {
  const { setDocumentTitle } = useAppConfig();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showSkkhModal, setShowSkkhModal] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (animal?.title) {
      setDocumentTitle(animal.title);
    }
  }, [animal]);

  if (!animal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Data ternak tidak ditemukan</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-theme-primary text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addToCart(animal, '', quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = async () => {
    await addToCart(animal, '', quantity);
    if (!isAuthenticated) {
      sessionStorage.setItem('ternakmart_redirect_url', 'checkout');
      onNavigate('checkout', { animalId: animal.id });
    } else {
      onNavigate('checkout', { animalId: animal.id });
    }
  };

  const images = Array.isArray(animal.images) && animal.images.length > 0
    ? animal.images
    : ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-32">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
      </button>

      {/* Main Grid: Gallery + Livestock Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-theme-border aspect-[4/3] flex items-center justify-center">
            {showVideo && animal.video_url ? (
              <video
                src={animal.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={images[activeImage]}
                alt={animal.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Video Toggle Button if video exists */}
            {animal.video_url && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-black/90 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {showVideo ? 'Tampilkan Foto' : 'Putar Video Fisik'}
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImage(idx);
                  setShowVideo(false);
                }}
                className={`w-20 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImage === idx && !showVideo
                    ? 'border-theme-primary ring-2 ring-theme-primary/30 scale-105'
                    : 'border-theme-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* SKKH Banner & Inspection Trigger */}
          <div className="p-4 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-theme-text">Surat Keterangan Kesehatan Hewan (SKKH)</p>
                <p className="text-[11px] text-theme-muted">
                  {animal.skkh_verification_status ? 'Terverifikasi Sah oleh Dinas Peternakan' : 'Dalam proses audit kelayakan fisik'}
                </p>
              </div>
            </div>
            {animal.skkh_certificate_url && (
              <button
                onClick={() => setShowSkkhModal(true)}
                className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold text-theme-primary hover:bg-theme-border/50 transition-colors"
              >
                Lihat Berkas
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Specs, Price & Purchase (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-theme-primary-light text-theme-primary text-xs font-black tracking-wide">
                {animal.category}
              </span>
              {animal.is_qurban_eligible && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  ✓ Sah Syarat Qurban
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text leading-tight">
              {animal.title}
            </h1>
            <p className="text-xs sm:text-sm text-theme-muted mt-1">Ras Ternak: <strong className="text-theme-text">{animal.breed}</strong></p>
          </div>

          {/* Price Tag */}
          <div className="p-5 rounded-3xl bg-theme-card border border-theme-border shadow-sm">
            <span className="text-xs text-theme-muted font-medium block">Harga Resmi Kandang</span>
            <div className="text-3xl sm:text-4xl font-black text-theme-primary mt-1">
              {formatRupiah(animal.price)}
            </div>
            <p className="text-[11px] text-theme-muted mt-1">
              *Harga sudah termasuk pakan titip rawat gratis sampai hari pengiriman H-3 Idul Adha.
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border">
              <span className="text-[10px] uppercase tracking-wider text-theme-muted block font-semibold">Bobot Riil</span>
              <span className="text-base font-extrabold text-theme-text mt-0.5 block">{formatWeight(animal.weight_kg)}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border">
              <span className="text-[10px] uppercase tracking-wider text-theme-muted block font-semibold">Gigi Poel</span>
              <span className="text-base font-extrabold text-theme-text mt-0.5 block">{animal.teeth_poel.replace('_', ' ')}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border">
              <span className="text-[10px] uppercase tracking-wider text-theme-muted block font-semibold">Usia Ternak</span>
              <span className="text-base font-extrabold text-theme-text mt-0.5 block">{animal.age_months} Bulan</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border">
              <span className="text-[10px] uppercase tracking-wider text-theme-muted block font-semibold">Jenis Kelamin</span>
              <span className="text-base font-extrabold text-theme-text mt-0.5 block">{animal.gender}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-theme-muted block font-semibold">Riwayat Vaksinasi</span>
              <span className="text-xs font-bold text-theme-text mt-0.5 block line-clamp-1">{animal.vaccination_status || 'Vaksin PMK Lengkap'}</span>
            </div>
          </div>

          {/* Farm Store Card */}
          {animal.store && (
            <div className="p-4 rounded-3xl bg-theme-card border border-theme-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-theme-text truncate">{animal.store.store_name}</h3>
                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                      {animal.store.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-theme-muted truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {animal.store.farm_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-theme-bg/80 p-3 rounded-2xl border border-theme-border">
            <span className="text-xs font-bold text-theme-text">Jumlah Ekor / Pesanan:</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-theme-card border border-theme-border flex items-center justify-center text-theme-text hover:bg-theme-border/50 transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-black text-theme-text">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-theme-card border border-theme-border flex items-center justify-center text-theme-text hover:bg-theme-border/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-2xl bg-theme-card border border-theme-border hover:bg-theme-bg font-extrabold text-xs text-theme-text flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-theme-primary" />
                <span>{addedSuccess ? '✓ Ditambahkan!' : 'Tambah Keranjang'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-theme-primary/30 transition-all"
              >
                Beli Sekarang
              </button>
            </div>

            {/* Direct Chat / Negotiate Price Button */}
            <button
              onClick={() => onStartChat && onStartChat(animal.store?.user_id || 'usr_seller_001', animal)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Peternak & Tawar Harga Instan
            </button>
          </div>
        </div>
      </div>

      {/* SKKH Modal Preview */}
      {showSkkhModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-theme-text">Berkas Surat Keterangan Kesehatan Hewan</h3>
              </div>
              <button
                onClick={() => setShowSkkhModal(false)}
                className="p-1 text-theme-muted hover:text-theme-text font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-theme-border">
              <img
                src={animal.skkh_certificate_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'}
                alt="Sertifikat SKKH"
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-theme-muted">
                Status Verifikasi: <strong className="text-emerald-600">Sah / Terdaftar</strong>
              </span>
              <button
                onClick={() => setShowSkkhModal(false)}
                className="px-4 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
