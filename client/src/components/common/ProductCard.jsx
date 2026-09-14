// ProductCard.jsx - Reusable Livestock Card for Active Storefront (Guest Mode Ready)
import React from 'react';
import { ShieldCheck, MapPin, MessageCircle, ShoppingBag, ArrowRight, Play, Heart } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export default function ProductCard({
  animal,
  onSelectAnimal,
  onAddToCart,
  onQuickBuy,
  onChatSeller
}) {
  if (!animal) return null;

  const images = Array.isArray(animal.images) && animal.images.length > 0
    ? animal.images
    : [animal.image_url || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'];

  const mainImage = images[0];
  const hasVideo = Boolean(animal.video_url);

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col group">
      {/* Media Thumbnail Container */}
      <div 
        onClick={() => onSelectAnimal && onSelectAnimal(animal)}
        className="relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
      >
        <img
          src={mainImage}
          alt={animal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* SKKH Verified Badge (Pulsing Indicator) */}
        {animal.skkh_verification_status !== false && (
          <div className="absolute top-3 left-3 bg-emerald-700/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            <span>SKKH Bersertifikat</span>
          </div>
        )}

        {/* Video Player Badge */}
        {hasVideo && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
            <Play className="w-3 h-3 fill-white" />
            <span>Video Fisik</span>
          </div>
        )}

        {/* Weight Tag Badge */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-theme-text text-[10px] font-black px-2 py-0.5 rounded-lg backdrop-blur-md shadow-xs">
          {animal.weight_kg ? `${animal.weight_kg} kg` : 'Siap Timbang'}
        </div>
      </div>

      {/* Livestock Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-theme-muted font-semibold">
            <span className="bg-theme-primary-light text-theme-primary px-2 py-0.5 rounded-md font-bold">
              {animal.breed || animal.category}
            </span>
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 text-theme-primary flex-shrink-0" />
              <span className="truncate">{animal.store?.farm_address?.split(',')[0] || 'Kandang Mitra'}</span>
            </span>
          </div>

          <h3 
            onClick={() => onSelectAnimal && onSelectAnimal(animal)}
            className="font-extrabold text-sm text-theme-text line-clamp-2 leading-snug cursor-pointer hover:text-theme-primary transition-colors"
          >
            {animal.title}
          </h3>

          <div className="flex items-center gap-2 pt-0.5 text-[11px] text-theme-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Farm: <strong>{animal.store?.store_name || 'Peternak Barokah'}</strong></span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-theme-border/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-theme-muted block leading-none">Harga Transparan</span>
            <span className="text-base font-black text-theme-primary">
              {formatRupiah(animal.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add to Cart (Guest can click freely) */}
            <button
              onClick={() => onAddToCart && onAddToCart(animal)}
              className="p-2.5 rounded-xl border border-theme-border text-theme-text hover:bg-theme-primary-light hover:text-theme-primary active:scale-95 transition-all"
              title="Masukkan Keranjang"
              aria-label="Tambah ke Keranjang"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Chat Seller (Auth-Gated) */}
            <button
              onClick={() => onChatSeller && onChatSeller(animal)}
              className="p-2.5 rounded-xl border border-theme-border text-theme-text hover:bg-theme-primary-light hover:text-theme-primary active:scale-95 transition-all"
              title="Chat & Nego Peternak"
              aria-label="Chat Penjual"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Buy Now (Auth-Gated) */}
            <button
              onClick={() => onQuickBuy && onQuickBuy(animal)}
              className="px-3 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover active:scale-95 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
            >
              <span>Beli</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
