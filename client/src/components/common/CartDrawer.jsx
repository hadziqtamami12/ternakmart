// CartDrawer.jsx - Interactive Slide-Out Cart Sidebar on the Right
import React, { useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Store
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function CartDrawer({ onNavigate, onSelectAnimal }) {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    count,
    updateQuantity,
    removeFromCart
  } = useCart();
  const { isAuthenticated } = useAuth();

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const totalPrice = items.reduce(
    (sum, i) => sum + parseFloat(i.price || 0) * (i.quantity || 1),
    0
  );

  const handleCheckout = () => {
    closeDrawer();
    if (!isAuthenticated) {
      sessionStorage.setItem('ternakmart_redirect_url', 'checkout');
      onNavigate('auth', { redirect: 'checkout', animalId: items[0]?.animal_id });
    } else {
      onNavigate('checkout', { animalId: items[0]?.animal_id });
    }
  };

  const handleViewFullCart = () => {
    closeDrawer();
    onNavigate('cart');
  };

  const handleItemClick = (item) => {
    closeDrawer();
    if (onSelectAnimal) {
      onSelectAnimal(item);
    } else {
      onNavigate('catalog');
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex justify-end">
      {/* Dark Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Panel from Right */}
      <div className="relative z-10 w-full max-w-md bg-theme-card border-l border-theme-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-theme-border flex items-center justify-between bg-theme-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-theme-text">Keranjang Belanja</h2>
              <p className="text-[11px] text-theme-muted">{count} ekor hewan siap di-checkout</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-colors"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-theme-border/60">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-theme-primary-light text-theme-primary flex items-center justify-center mx-auto text-2xl">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-theme-text">Keranjang Anda Kosong</h3>
              <p className="text-xs text-theme-muted max-w-xs">
                Jelajahi berbagai pilihan sapi qurban, domba garut, dan kambing etawa berkualitas kami.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  onNavigate('catalog');
                }}
                className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-sm"
              >
                Jelajahi Katalog Ternak
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemQty = item.quantity || 1;
              const itemTotal = parseFloat(item.price || 0) * itemQty;

              return (
                <div key={item.animal_id} className="pt-3 first:pt-0 flex gap-3.5 items-start">
                  <img
                    src={
                      (item.images && item.images[0]) ||
                      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={item.title}
                    onClick={() => handleItemClick(item)}
                    className="w-16 h-16 rounded-xl object-cover border border-theme-border flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    title="Klik untuk detail"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-theme-primary bg-theme-primary-light px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.animal_id)}
                        className="text-theme-muted hover:text-red-500 p-1 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      onClick={() => handleItemClick(item)}
                      className="text-xs font-bold text-theme-text mt-1 truncate cursor-pointer hover:text-theme-primary"
                    >
                      {item.title}
                    </h4>

                    <p className="text-[10px] text-theme-muted mt-0.5">
                      {formatWeight(item.weight_kg)} • {formatRupiah(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5 bg-theme-bg border border-theme-border rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.animal_id, itemQty - 1)}
                          className="w-6 h-6 rounded bg-theme-card flex items-center justify-center text-theme-text hover:bg-theme-border/50 text-xs font-bold"
                          title="Kurang"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-theme-text">
                          {itemQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.animal_id, itemQty + 1)}
                          className="w-6 h-6 rounded bg-theme-card flex items-center justify-center text-theme-text hover:bg-theme-border/50 text-xs font-bold"
                          title="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-theme-primary">
                        {formatRupiah(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Subtotal & Actions */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-theme-border bg-theme-bg/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-muted">Subtotal ({count} ekor):</span>
              <span className="text-base font-black text-theme-primary">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleViewFullCart}
              className="w-full py-2.5 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-bg text-theme-text text-xs font-bold transition-colors text-center block"
            >
              Lihat Halaman Keranjang Lengkap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
