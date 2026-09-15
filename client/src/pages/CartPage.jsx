// CartPage.jsx - Livestock Cart with Dual-Mode (Direct Checkout vs Bulk Select), Long-Press Trigger, Quantity Adjust
import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  ArrowRight,
  Store,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Layers,
  Zap,
  Tag,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { CartSkeleton } from '../components/common/Skeletons';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage({ onNavigate, onSelectAnimal }) {
  const { setDocumentTitle } = useAppConfig();
  const { items, loading, removeFromCart, updateQuantity, bulkDelete, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Mode: regular (direct buy per item) vs bulk (multi-selection)
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Coupon / Voucher state
  const [cartVoucherCode, setCartVoucherCode] = useState('');
  const [cartAppliedVoucher, setCartAppliedVoucher] = useState(null);
  const [cartVoucherError, setCartVoucherError] = useState('');
  const [cartVoucherLoading, setCartVoucherLoading] = useState(false);

  // Long press timer ref
  const pressTimerRef = useRef(null);

  useEffect(() => {
    setDocumentTitle('Keranjang Belanja Ternak');
  }, []);

  // Sync selectedIds with items
  useEffect(() => {
    if (items.length > 0 && isBulkMode && selectedIds.length === 0) {
      setSelectedIds(items.map(i => i.animal_id));
    }
  }, [isBulkMode, items]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.animal_id));
    }
  };

  const handleToggleItem = (animalId) => {
    if (selectedIds.includes(animalId)) {
      setSelectedIds(prev => prev.filter(id => id !== animalId));
    } else {
      setSelectedIds(prev => [...prev, animalId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} hewan ternak terpilih dari keranjang?`)) {
      await bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  // Apply Coupon Handler
  const handleApplyCartVoucher = async (codeOverride) => {
    const code = (typeof codeOverride === 'string' ? codeOverride : cartVoucherCode || '').trim().toUpperCase();
    if (!code) return;
    setCartVoucherError('');
    setCartVoucherLoading(true);
    try {
      const targetBase = selectedItems.reduce((sum, i) => sum + (parseFloat(i.price || 0) * (i.quantity || 1)), 0) ||
        items.reduce((sum, i) => sum + (parseFloat(i.price || 0) * (i.quantity || 1)), 0);
      const res = await api.post('/vouchers/check', {
        code: code,
        amount: targetBase
      });
      if (res.success && res.data) {
        setCartAppliedVoucher(res.data);
        setCartVoucherCode(code);
      }
    } catch (err) {
      setCartVoucherError(err.message || 'Kupon tidak dapat digunakan.');
      setCartAppliedVoucher(null);
    } finally {
      setCartVoucherLoading(false);
    }
  };

  // Direct checkout for a single animal
  const handleDirectCheckout = (animalId) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('ternakmart_redirect_url', 'checkout');
      onNavigate('auth', { redirect: 'checkout', animalId, voucherCode: cartVoucherCode });
    } else {
      onNavigate('checkout', { animalId, animalIds: [animalId], voucherCode: cartVoucherCode });
    }
  };

  // Bulk checkout for all selected animals
  const handleBulkCheckout = () => {
    if (selectedIds.length === 0) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('ternakmart_redirect_url', 'checkout');
      onNavigate('auth', { redirect: 'checkout', animalId: selectedIds[0], animalIds: selectedIds, voucherCode: cartVoucherCode });
    } else {
      onNavigate('checkout', { animalId: selectedIds[0], animalIds: selectedIds, voucherCode: cartVoucherCode });
    }
  };

  // Long press handling to activate bulk mode
  const handleTouchStart = (animalId) => {
    pressTimerRef.current = setTimeout(() => {
      setIsBulkMode(true);
      if (!selectedIds.includes(animalId)) {
        setSelectedIds(prev => [...prev, animalId]);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleItemClick = async (item) => {
    const targetId = item.animal_id || item.id;
    try {
      const res = await api.get(`/animals/detail/${targetId}`);
      if (res.success && res.data) {
        if (onSelectAnimal) onSelectAnimal(res.data);
        return;
      }
    } catch (e) {}
    if (onSelectAnimal) {
      onSelectAnimal(item);
    } else {
      onNavigate('catalog');
    }
  };

  // Group items by store
  const storeGroups = items.reduce((acc, item) => {
    const storeId = item.store_id || 'unknown';
    if (!acc[storeId]) {
      acc[storeId] = {
        store_name: item.store_name || 'Peternakan Mitra',
        store_tier: item.store_tier || 'STAR_SELLER',
        farm_address: item.farm_address,
        items: []
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {});

  // Calculate totals for selected items
  const activeSelected = isBulkMode ? selectedIds : items.map(i => i.animal_id);
  const selectedItems = items.filter(i => activeSelected.includes(i.animal_id));
  const totalSelectedCount = selectedItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalSelectedPrice = selectedItems.reduce((sum, i) => sum + (parseFloat(i.price || 0) * (i.quantity || 1)), 0);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-theme-text">Keranjang Belanja Ternak</h1>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-theme-primary-light text-theme-primary flex items-center justify-center mx-auto text-2xl">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-theme-text">Keranjang Belanja Masih Kosong</h2>
        <p className="text-xs text-theme-muted max-w-sm mx-auto">
          Pilih hewan ternak sehat bersertifikasi SKKH dari peternak terpercaya dan masukkan ke keranjang belanja Anda.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 rounded-2xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover transition-colors shadow-md"
        >
          Lihat Katalog Ternak
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 pb-64 sm:pb-48 overflow-x-hidden w-full max-w-full box-border">
      {/* Top Header & Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-theme-text flex items-center gap-2">
            <span>Keranjang Belanja Ternak</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-theme-primary-light text-theme-primary font-bold">
              {items.length} jenis
            </span>
          </h1>
          <p className="text-xs text-theme-muted mt-0.5">
            Bisa beli langsung tiap ternak atau aktifkan mode pilih banyak untuk checkout borongan.
          </p>
        </div>

        {/* Action Controls: Mode Switcher & Clear */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Bulk Select Button */}
          <button
            onClick={() => {
              const nextMode = !isBulkMode;
              setIsBulkMode(nextMode);
              if (nextMode && selectedIds.length === 0) {
                setSelectedIds(items.map(i => i.animal_id));
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isBulkMode
                ? 'bg-theme-primary text-white shadow-md'
                : 'bg-theme-card border border-theme-border text-theme-text hover:bg-theme-border/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isBulkMode ? 'Tutup Pilih Banyak' : 'Mode Pilih Banyak (Bulk)'}</span>
          </button>

          {isBulkMode && (
            <>
              {/* Select All */}
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-2 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs font-bold flex items-center gap-1.5 hover:bg-theme-border/40"
              >
                {allSelected ? <CheckSquare className="w-4 h-4 text-theme-primary" /> : <Square className="w-4 h-4 text-theme-muted" />}
                <span>{allSelected ? 'Batal Semua' : 'Pilih Semua'}</span>
              </button>

              {/* Bulk Delete */}
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedIds.length})</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={clearCart}
            className="text-xs text-theme-muted hover:text-red-500 font-bold transition-colors px-2 py-1"
          >
            Kosongkan
          </button>
        </div>
      </div>

      {/* Helper Tip for Long Press */}
      {!isBulkMode && (
        <div className="bg-theme-bg/60 border border-theme-border rounded-2xl px-4 py-2.5 text-[11px] text-theme-muted flex items-center justify-between">
          <span>💡 Tip: Tekan & tahan kartu ternak atau klik <b>Mode Pilih Banyak</b> untuk memilih beberapa hewan sekaligus.</span>
        </div>
      )}

      {/* Store Grouped Items */}
      <div className="space-y-6">
        {Object.entries(storeGroups).map(([storeId, group]) => (
          <div key={storeId} className="bg-theme-card border border-theme-border rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-sm overflow-hidden w-full max-w-full">
            {/* Kandang / Store Header */}
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <h2 className="text-sm font-bold text-theme-text truncate">{group.store_name}</h2>
                <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {group.store_tier}
                </span>
              </div>
              <span className="text-[11px] text-theme-muted flex-shrink-0">{group.items.length} Ternak</span>
            </div>

            {/* Animal Row Items */}
            <div className="divide-y divide-theme-border/60">
              {group.items.map((item) => {
                const isSelected = selectedIds.includes(item.animal_id);
                const itemQty = item.quantity || 1;
                const itemTotalPrice = parseFloat(item.price || 0) * itemQty;

                return (
                  <div
                    key={item.animal_id || item.id}
                    onMouseDown={() => handleTouchStart(item.animal_id)}
                    onMouseUp={handleTouchEnd}
                    onTouchStart={() => handleTouchStart(item.animal_id)}
                    onTouchEnd={handleTouchEnd}
                    className={`py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 transition-colors rounded-2xl w-full max-w-full overflow-hidden ${
                      isBulkMode && isSelected ? 'bg-theme-primary-light/20 p-2' : ''
                    }`}
                  >
                    {/* Checkbox (if bulk mode) + Thumbnail + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 w-full overflow-hidden">
                      {isBulkMode && (
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.animal_id)}
                          className="p-1 text-theme-muted hover:text-theme-primary transition-colors flex-shrink-0"
                          aria-label="Pilih hewan ternak ini"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-theme-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-theme-muted" />
                          )}
                        </button>
                      )}

                      {/* Clickable Image -> Detail */}
                      <img
                        src={(item.images && item.images[0]) || item.image_url || item.primary_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        onClick={() => handleItemClick(item)}
                        className="w-16 h-16 sm:w-20 sm:h-20 min-w-16 min-h-16 max-w-16 max-h-16 sm:min-w-20 sm:min-h-20 sm:max-w-20 sm:max-h-20 rounded-2xl object-cover border border-theme-border flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        title="Klik untuk melihat detail ternak"
                      />

                      {/* Clickable Title & Details */}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-theme-primary bg-theme-primary-light px-2 py-0.5 rounded-md truncate max-w-[130px]">
                            {item.breed || item.category || 'TERNAK'}
                          </span>
                          {item.skkh_verification_status && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 flex-shrink-0">
                              <ShieldCheck className="w-3 h-3" /> SKKH
                            </span>
                          )}
                        </div>
                        <h3
                          onClick={() => handleItemClick(item)}
                          className="text-sm font-bold text-theme-text mt-1 cursor-pointer hover:text-theme-primary transition-colors truncate"
                          title="Klik untuk melihat detail ternak"
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-theme-muted mt-0.5 truncate">
                          {item.farm_address ? `${item.farm_address.split(',')[0]} • ` : ''}Bobot: {formatWeight(item.weight_kg)} • {formatRupiah(item.price)}/ekor
                        </p>
                      </div>
                    </div>

                    {/* Right Controls: Quantity Adjust + Subtotal + Actions */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-2.5 sm:gap-3 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-theme-border/40">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-theme-bg border border-theme-border rounded-xl p-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.animal_id, itemQty - 1)}
                          className="w-7 h-7 rounded-lg bg-theme-card flex items-center justify-center text-theme-text hover:bg-theme-border/50 transition-colors"
                          title="Kurangi jumlah"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-theme-text">
                          {itemQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.animal_id, itemQty + 1)}
                          className="w-7 h-7 rounded-lg bg-theme-card flex items-center justify-center text-theme-text hover:bg-theme-border/50 transition-colors"
                          title="Tambah jumlah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal Item Price */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-theme-primary block">
                          {formatRupiah(itemTotalPrice)}
                        </span>
                        {itemQty > 1 && (
                          <span className="text-[10px] text-theme-muted block">
                            ({itemQty} x {formatRupiah(item.price)})
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 ml-auto md:ml-0 flex-shrink-0">
                        {!isBulkMode ? (
                          <button
                            onClick={() => handleDirectCheckout(item.animal_id)}
                            className="px-3 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                            title="Beli langsung hewan ini sekarang"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Beli</span>
                          </button>
                        ) : null}

                        <button
                          onClick={() => removeFromCart(item.animal_id)}
                          className="p-1.5 text-theme-muted hover:text-red-500 rounded-xl transition-colors hover:bg-red-500/10"
                          title="Hapus item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Kupon Promo & Diskon Belanja in Cart */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Tag className="w-4 h-4 text-theme-primary" /> Kupon Promo & Diskon Belanja
          </h2>
          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Hemat s/d 15%
          </span>
        </div>

        {/* Quick Recommendation Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-theme-muted">Kupon Tersedia:</span>
          <button
            type="button"
            onClick={() => {
              setCartVoucherCode('QURBANBERKAH');
              handleApplyCartVoucher('QURBANBERKAH');
            }}
            className="px-2.5 py-1 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30 text-theme-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>QURBANBERKAH (15% OFF)</span>
          </button>
        </div>

        {/* Input & Apply Button */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik kode kupon (cth: QURBANBERKAH)"
            value={cartVoucherCode}
            onChange={(e) => setCartVoucherCode(e.target.value.toUpperCase())}
            className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
          />
          <button
            type="button"
            disabled={cartVoucherLoading}
            onClick={() => handleApplyCartVoucher(cartVoucherCode)}
            className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {cartVoucherLoading ? 'Memeriksa...' : 'Gunakan Kupon'}
          </button>
        </div>

        {/* Applied Coupon Info */}
        {cartAppliedVoucher && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Kupon <strong>{cartAppliedVoucher.voucher_code}</strong> aktif! Diskon:{' '}
                -{formatRupiah(cartAppliedVoucher.calculated_discount || cartAppliedVoucher.discount_amount || cartAppliedVoucher.discount_value || 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartAppliedVoucher(null);
                setCartVoucherCode('');
              }}
              className="text-xs text-rose-500 hover:underline font-bold flex-shrink-0"
            >
              Batal
            </button>
          </div>
        )}

        {cartVoucherError && (
          <p className="text-xs text-rose-500 font-semibold">{cartVoucherError}</p>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] lg:bottom-0 left-0 right-0 z-40 bg-theme-card border-t border-theme-border shadow-[0_-8px_25px_rgba(0,0,0,0.1)] p-3 sm:p-4"
        style={{ backgroundColor: 'var(--color-card, #ffffff)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            {isBulkMode ? (
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-theme-text"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-theme-primary" />
                ) : (
                  <Square className="w-4 h-4 text-theme-muted" />
                )}
                <span>Pilih Semua ({items.length})</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-theme-muted">
                Total Belanja Keranjang:
              </span>
            )}

            <div className="text-right">
              {cartAppliedVoucher ? (
                <>
                  <span className="text-[11px] text-theme-muted line-through block">
                    {formatRupiah(totalSelectedPrice)}
                  </span>
                  <span className="text-base font-extrabold text-theme-primary block">
                    {formatRupiah(Math.max(0, totalSelectedPrice - parseFloat(cartAppliedVoucher.calculated_discount || cartAppliedVoucher.discount_amount || cartAppliedVoucher.discount_value || 0)))}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    Hemat {formatRupiah(parseFloat(cartAppliedVoucher.calculated_discount || cartAppliedVoucher.discount_amount || cartAppliedVoucher.discount_value || 0))} ({totalSelectedCount} ekor)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-extrabold text-theme-primary block">
                    {formatRupiah(totalSelectedPrice)}
                  </span>
                  <span className="text-[10px] text-theme-muted block">
                    {totalSelectedCount} ekor {isBulkMode ? 'terpilih' : 'total'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {isBulkMode ? (
              <button
                onClick={handleBulkCheckout}
                disabled={selectedIds.length === 0}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Checkout Borongan ({selectedIds.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  // Direct checkout all or first item
                  handleDirectCheckout(items[0].animal_id);
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Lanjut Checkout ({items.length} Hewan)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
