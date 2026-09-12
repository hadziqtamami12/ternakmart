import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { useCart } from '../../context/CartContext';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function MobileHeader({ onNavigate, searchQuery, setSearchQuery, onSelectAnimal }) {
  const { config } = useAppConfig();
  const cartCtx = useCart();
  const cartCount = cartCtx?.count || 0;
  const openDrawer = cartCtx?.openDrawer || (() => onNavigate('cart'));
  const { isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleOpenCart = () => {
    if (cartCtx && typeof cartCtx.openDrawer === 'function') {
      cartCtx.openDrawer();
    } else {
      onNavigate('cart');
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/animals?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.success && res.data) {
          setSuggestions(res.data.slice(0, 5));
        }
      } catch (err) {
        console.warn('Mobile search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="lg:hidden sticky top-0 z-40 glass-nav border-b border-theme-border/80 h-16 px-4 flex items-center justify-between transition-colors">
      {/* Dynamic Branding Logo with Livestock Icon Fallback */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
      >
        {config.app_logo_url ? (
          <img
            src={config.app_logo_url}
            alt={config.app_name}
            className="w-9 h-9 rounded-xl object-cover border border-theme-border shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-lg">
            🐂
          </div>
        )}
        <span className="text-base font-extrabold tracking-tight text-theme-text">
          {config.app_name}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Cari hewan ternak"
          className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-text"
        >
          {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        {/* Mobile Cart Icon -> Opens Cart Drawer */}
        <button
          onClick={handleOpenCart}
          className="relative p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-text"
          aria-label="Keranjang Belanja"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-theme-card">
              {cartCount}
            </span>
          )}
        </button>

        {isAuthenticated && <NotificationDropdown />}
      </div>

      {/* Expandable Search Input for Mobile with Clean Backdrop */}
      {isSearchOpen && (
        <>
          <div
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          />
          <div className="absolute left-0 right-0 top-16 bg-theme-card border-b border-theme-border p-3 shadow-2xl z-50 animate-in slide-in-from-top duration-150 max-h-[80vh] overflow-y-auto">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Cari Sapi, Domba, Kambing, SKKH..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('catalog');
                    setIsSearchOpen(false);
                  }
                }}
                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-9 py-2 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-theme-muted hover:text-theme-text text-xs font-bold"
                >
                  ✕
                </button>
              )}
              {isSearching && (
                <div className="absolute right-8 top-2.5 w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

          {/* Autocomplete Results in Mobile */}
          {suggestions.length > 0 && (
            <div className="mt-2 divide-y divide-theme-border/50">
              <p className="text-[10px] font-bold text-theme-muted py-1">Hasil Pencarian Cepat:</p>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    if (onSelectAnimal) {
                      onSelectAnimal(item);
                    } else {
                      onNavigate('catalog');
                    }
                  }}
                  className="py-2 flex items-center gap-2.5 cursor-pointer active:bg-theme-bg"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                    alt={item.title}
                    className="w-9 h-9 rounded-lg object-cover border border-theme-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-theme-text truncate">{item.title}</p>
                    <p className="text-[11px] font-extrabold text-theme-primary">{formatRupiah(item.price)}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onNavigate('catalog');
                }}
                className="w-full text-center py-2 text-xs font-bold text-theme-primary hover:underline"
              >
                Lihat Semua Hasil di Katalog →
              </button>
            </div>
          )}
          </div>
        </>
      )}
    </header>
  );
}
