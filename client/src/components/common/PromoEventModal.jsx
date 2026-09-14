// PromoEventModal.jsx - Homepage Promotional & Special Event Popup Modal
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Tag, ArrowRight, Check, Copy } from 'lucide-react';

export default function PromoEventModal({ config, onNavigate, forceOpen = false, onClosePreview }) {
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

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!isEnabled) {
      setIsOpen(false);
      return;
    }

    // Check sessionStorage so it only shows once per user browser session
    const sessionKey = `ternakmart_promo_dismissed_${promoCode}`;
    const dismissed = sessionStorage.getItem(sessionKey);
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200); // Friendly 1.2s delay after page loads
      return () => clearTimeout(timer);
    }
  }, [isEnabled, promoCode, forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClosePreview) onClosePreview();
    const sessionKey = `ternakmart_promo_dismissed_${promoCode}`;
    sessionStorage.setItem(sessionKey, 'true');
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
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Fixed Full Screen Backdrop Scrim */}
      <div
        onClick={handleClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-[100dvh] bg-black/40 backdrop-blur-sm -z-10 cursor-pointer"
      />

      <div className="relative w-full max-w-lg bg-theme-card border border-theme-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all hover:scale-105"
          aria-label="Tutup promo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Banner Image with Overlay Gradient */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
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
        <div className="p-6 sm:p-7 space-y-4 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight leading-tight">
              {promoTitle}
            </h2>
            <p className="text-xs text-theme-muted mt-2 leading-relaxed">
              {promoSubtitle}
            </p>
          </div>

          {/* Promo Code Box with Copy */}
          {promoCode && (
            <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Tag className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-theme-muted font-bold block uppercase tracking-wider">
                    Kode Promo Khusus
                  </span>
                  <span className="font-mono text-sm font-black text-theme-primary tracking-wider">
                    {promoCode}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kupon'}</span>
              </button>
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
