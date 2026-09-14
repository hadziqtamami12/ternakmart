import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { useCart } from '../../context/CartContext';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function MobileHeader({ onNavigate, currentPage = 'home', searchQuery, setSearchQuery, onSelectAnimal }) {
  const { config } = useAppConfig();
  const cartCtx = useCart();
  const cartCount = cartCtx?.count || 0;
  const openDrawer = cartCtx?.openDrawer || (() => onNavigate('cart'));
  const { isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll on mobile
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isHomeTransparent = currentPage === 'home' && !isScrolled;

  return (
    <header
      className={`lg:hidden fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between transition-all duration-300 ${
        isHomeTransparent
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white border-transparent'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-md'
      }`}
    >
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
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
            isHomeTransparent ? 'bg-white/20 border border-white/30 backdrop-blur-md' : 'bg-theme-primary/10 border border-theme-primary/30'
          }`}>
            🐂
          </div>
        )}
        <span className={`text-base font-extrabold tracking-tight ${
          isHomeTransparent ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}>
          {config.app_name}
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 rounded-xl transition-colors ${
            isHomeTransparent ? 'text-white hover:bg-white/15' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Cari Hewan"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Cart Icon */}
        <button
          onClick={handleOpenCart}
          className={`relative p-2 rounded-xl transition-colors ${
            isHomeTransparent ? 'text-white hover:bg-white/15' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Buka Keranjang"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-theme-primary text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-theme-card">
              {cartCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        {isAuthenticated && <NotificationDropdown />}
      </div>

      {/* Full-Screen Mobile Search Sheet */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-theme-bg flex flex-col h-[100dvh] w-full animate-in fade-in duration-150">
          {/* Top Search Bar */}
          <div className="p-3.5 bg-theme-card border-b border-theme-border flex items-center gap-2 shadow-sm">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                placeholder="Cari Sapi Limosin, Domba, Kambing, SKKH..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('catalog');
                    setIsSearchOpen(false);
                  }
                }}
                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-9 py-2.5 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-2.5 p-1 text-theme-muted hover:text-theme-text text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="px-3 py-2 text-xs font-bold text-theme-muted hover:text-theme-text"
            >
              Batal
            </button>
          </div>

          {/* Search Content & Suggestions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Popular Search Chips */}
            <div>
              <p className="text-[11px] font-bold text-theme-muted uppercase tracking-wider mb-2">
                Pencarian Populer:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🐂 Sapi Limosin', query: 'Limosin' },
                  { label: '🐑 Domba Garut', query: 'Domba Garut' },
                  { label: '🐐 Kambing Etawa', query: 'Etawa' },
                  { label: '✅ SKKH Resmi', query: 'SKKH' },
                  { label: '⭐ Hewan Qurban', query: 'Qurban' }
                ].map((tag) => (
                  <button
                    key={tag.query}
                    type="button"
                    onClick={() => {
                      if (setSearchQuery) setSearchQuery(tag.query);
                      onNavigate('catalog');
                      setIsSearchOpen(false);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-theme-card border border-theme-border text-theme-text hover:text-theme-primary active:bg-theme-primary/10 transition-colors"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Autocomplete Results */}
            {suggestions.length > 0 && (
              <div className="pt-2 border-t border-theme-border space-y-2">
                <p className="text-[11px] font-bold text-theme-muted">Hasil Ditemukan Langsung:</p>
                <div className="divide-y divide-theme-border/60">
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
                      className="py-3 flex items-center gap-3 cursor-pointer active:bg-theme-card/60 transition-colors"
                    >
                      <img
                        src={item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                        alt={item.title}
                        className="w-14 h-14 rounded-2xl object-cover border border-theme-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-theme-text truncate">{item.title}</p>
                          <span className="text-xs font-black text-theme-primary flex-shrink-0">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-theme-muted">
                          <span className="bg-theme-primary/10 text-theme-primary px-1.5 py-0.5 rounded font-bold text-[9px]">
                            {item.category}
                          </span>
                          <span>• {formatWeight(item.weight_kg)}</span>
                          {item.skkh_verification_status && (
                            <span className="text-emerald-600 font-bold text-[9px]">• SKKH Sah</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onNavigate('catalog');
                  }}
                  className="w-full text-center py-3 text-xs font-extrabold text-theme-primary bg-theme-primary/10 rounded-2xl hover:bg-theme-primary/20 transition-colors block mt-2"
                >
                  Lihat Semua Hasil di Katalog →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
