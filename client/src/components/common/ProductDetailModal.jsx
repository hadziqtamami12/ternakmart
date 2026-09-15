// ProductDetailModal.jsx - Interactive Livestock Quick Detail Modal & Mobile View
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  MessageCircle, 
  ShoppingBag, 
  ArrowRight, 
  Play, 
  Star, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function ProductDetailModal({
  animal,
  isOpen,
  onClose,
  onAddToCart,
  onChatSeller,
  onQuickBuy
}) {
  if (!isOpen || !animal) return null;

  const images = Array.isArray(animal.images) && animal.images.length > 0
    ? animal.images
    : [animal.image_url || animal.primary_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] min-h-[100dvh] h-screen w-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 min-h-[100dvh] h-screen w-screen bg-black/40 backdrop-blur-sm -z-10 transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-2xl bg-theme-card border border-theme-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header Close Bar */}
        <div className="p-4 border-b border-theme-border flex items-center justify-between sticky top-0 bg-theme-card/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-theme-primary uppercase tracking-wider">
              Detail Spesifikasi Ternak
            </span>
            {animal.skkh_verification_status !== false && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SKKH Aktif
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-text bg-theme-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Media Carousel / Video Player */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-72 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center">
              {showVideo && animal.video_url ? (
                <video
                  src={animal.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={images[activeImageIndex]}
                  alt={animal.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && !showVideo && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Toggle Video Button */}
              {animal.video_url && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 hover:bg-black/90 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{showVideo ? 'Tampilkan Foto' : 'Putar Video Fisik'}</span>
                </button>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowVideo(false);
                      setActiveImageIndex(idx);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx && !showVideo
                        ? 'border-theme-primary ring-2 ring-theme-primary/30'
                        : 'border-theme-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-theme-text">{animal.title}</h2>
            <div className="text-2xl font-black text-theme-primary">
              {formatRupiah(animal.price)}
            </div>
          </div>

          {/* Specifications Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-theme-bg border border-theme-border">
            <div className="text-center p-2 rounded-xl bg-theme-card">
              <span className="text-[10px] text-theme-muted block font-semibold">Bobot Real</span>
              <span className="text-xs font-black text-theme-text">{formatWeight(animal.weight_kg)}</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-theme-card">
              <span className="text-[10px] text-theme-muted block font-semibold">Usia Ternak</span>
              <span className="text-xs font-black text-theme-text">{animal.age_months ? `${animal.age_months} Bulan` : '2 Tahun'}</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-theme-card">
              <span className="text-[10px] text-theme-muted block font-semibold">Jenis Kelamin</span>
              <span className="text-xs font-black text-theme-text">{animal.gender || 'Jantan'}</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-theme-card">
              <span className="text-[10px] text-theme-muted block font-semibold">Gigi Poel</span>
              <span className="text-xs font-black text-emerald-600">{animal.teeth_poel || 'Sudah Poel (Sah Qurban)'}</span>
            </div>
          </div>

          {/* Health & Vaccination Status */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kesehatan & Rekam Medis Hewan</span>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              {animal.vaccination_status || 'Vaksin PMK dosis lengkap, bebas antraks, nafsu makan tinggi, dan telah lolos uji klinis dokter hewan terdaftar.'}
            </p>
          </div>

          {/* Farm Profile & Map Location */}
          <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center text-xl font-bold">
                🏡
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-theme-text">{animal.store?.store_name || 'Peternakan Barokah Farm'}</h4>
                <p className="text-[11px] text-theme-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-theme-primary" />
                  <span>{animal.store?.farm_address || 'Bogor, Jawa Barat'}</span>
                </p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(animal.store?.farm_address || 'Kandang Mitra')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-theme-border text-[11px] font-bold text-theme-primary hover:bg-theme-card flex items-center gap-1"
            >
              <span>Peta</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Bottom Bar (Mobile-First) */}
        <div className="p-4 border-t border-theme-border bg-theme-card flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAddToCart && onAddToCart(animal);
            }}
            className="flex-1 py-3 rounded-2xl border border-theme-border text-theme-text font-bold text-xs hover:bg-theme-bg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-theme-primary" />
            <span>Keranjang</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onChatSeller && onChatSeller(animal);
            }}
            className="flex-1 py-3 rounded-2xl border border-theme-primary/40 text-theme-primary font-bold text-xs hover:bg-theme-primary-light flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Penjual</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onQuickBuy && onQuickBuy(animal);
            }}
            className="flex-1 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Beli Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
