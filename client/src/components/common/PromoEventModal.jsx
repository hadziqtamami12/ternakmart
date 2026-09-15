// PromoEventModal.jsx - Homepage Promotional & Special Event Popup Modal
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Tag, ArrowRight, Check, Copy, Percent } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export default function PromoEventModal({ config, onNavigate, isOpen: controlledIsOpen, onClose, forceOpen = false, onClosePreview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEnabled = config?.promo_modal_enabled ?? true;
  const promoTitle = config?.promo_modal_title || 'Festival Qurban Akbar 1447H!';
  const promoBadge = config?.promo_modal_badge || 'DISKON HINGGA 15%';
  const promoSubtitle = config?.promo_modal_subtitle || 'Gunakan kupon khusus untuk mendapatkan potongan harga ternak dan gratis ongkos kirim ke seluruh Jabodetabek & Bandung!';
  const promoCode = config?.promo_modal_code || 'QURBANBERKAH';
  const promoImage = config?.promo_modal_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80';
  const promoCtaText = config?.promo_modal_cta_text || 'Serbu Promo Sekarang';
  const promoCategory = config?.promo_modal_category || 'SAPI';
  const promoDiscountType = config?.promo_modal_discount_type || 'PERCENT';
  const promoDiscountValue = config?.promo_modal_discount_value !== undefined ? config.promo_modal_discount_value : 15;
  const promoMaxCap = config?.promo_modal_max_cap !== undefined ? config.promo_modal_max_cap : 1500000;
  const promoMinPurchase = config?.promo_modal_min_purchase || 0;

  // Sync with controlled isOpen prop if provided
  useEffect(() => {
    if (controlledIsOpen === true) {
      setIsOpen(true);
    } else if (controlledIsOpen === false) {
      setIsOpen(false);
    }
  }, [controlledIsOpen]);

  // Global event listener for tapping kupon triggers
  useEffect(() => {
    const handleOpenKupon = () => setIsOpen(true);
    window.addEventListener('ternakmart_open_kupon', handleOpenKupon);
    return () => window.removeEventListener('ternakmart_open_kupon', handleOpenKupon);
  }, []);

  useEffect(() => {
    if (forceOpen || controlledIsOpen === true) {
      setIsOpen(true);
      return;
    }

    if (!isEnabled || controlledIsOpen === false) {
      setIsOpen(false);
      return;
    }

    // Auto show directly when active (both mobile and desktop)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 250); // 250ms smooth entrance after page loads
    return () => clearTimeout(timer);
  }, [isEnabled, forceOpen, controlledIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
    if (onClosePreview) onClosePreview();
  };

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard?.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCtaClick = () => {
    handleClose();
    if (onNavigate) {
      onNavigate('catalog', { category: promoCategory });
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Fixed Full Screen Backdrop Scrim */}
      <div
        onClick={handleClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-sm -z-10 cursor-pointer"
      />

      <div className="relative w-full max-w-[420px] sm:max-w-lg max-h-[90dvh] overflow-y-auto bg-theme-card border border-theme-border rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 my-auto z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all hover:scale-105"
          aria-label="Tutup promo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Banner Image with Overlay Gradient */}
        <div className="relative h-40 sm:h-52 w-full flex-shrink-0 overflow-hidden">
          <img
            src={promoImage}
            alt={promoTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-theme-card via-transparent to-black/30" />

          {/* Floating Badge */}
          <div className="absolute bottom-3 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-primary text-white text-[11px] font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              {promoBadge}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-7 space-y-3.5 text-center sm:text-left flex-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight leading-tight">
              {promoTitle}
            </h2>
            <p className="text-xs text-theme-muted mt-2 leading-relaxed">
              {promoSubtitle}
            </p>
          </div>

          {/* Promo Code Box with Copy & Discount Details */}
          {promoCode && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <div className="w-9 h-9 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-theme-muted font-bold block uppercase tracking-wider">
                      Kode Kupon Promo
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-theme-primary tracking-wider">
                      {promoCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 self-stretch sm:self-auto"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kupon'}</span>
                </button>
              </div>

              {/* Discount Reduction Detail Pill */}
              <div className="pt-2 border-t border-theme-border/60 flex items-center justify-between flex-wrap gap-2 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">
                    {promoDiscountType === 'PERCENT' ? (
                      <>
                        <Percent className="w-3 h-3" />
                        <span>Diskon {promoDiscountValue}% OFF</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3 h-3" />
                        <span>Potongan {formatRupiah(promoDiscountValue)}</span>
                      </>
                    )}
                  </span>

                  {promoDiscountType === 'PERCENT' && promoMaxCap && (
                    <span className="text-[10px] font-bold text-theme-muted bg-theme-card px-2 py-0.5 rounded-lg border border-theme-border">
                      Maks. {formatRupiah(promoMaxCap)}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-theme-muted font-medium">
                  {parseFloat(promoMinPurchase || 0) > 0 ? `Min. Belanja ${formatRupiah(promoMinPurchase)}` : 'Tanpa Min. Belanja'}
                </span>
              </div>
            </div>
          )}

          {/* Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full sm:flex-1 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{promoCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-theme-border hover:bg-theme-bg text-theme-muted hover:text-theme-text text-xs font-bold transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
