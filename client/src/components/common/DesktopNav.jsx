// DesktopNav.jsx - Standard E-Commerce Sticky Navigation with Seller Store Differentiator
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Store,
  User,
  LogOut,
  Package,
  MessageCircle,
  PlusCircle,
  ChevronDown,
  Compass,
  Truck,
  Clock
} from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationDropdown from './NotificationDropdown';
import TierBadge from './TierBadge';

import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';

export default function DesktopNav({ onNavigate, currentPage, searchQuery, setSearchQuery, onSelectAnimal }) {
  const { config } = useAppConfig();
  const { user, isAuthenticated, logout, isSeller } = useAuth();
  const cartCtx = useCart();
  const cartCount = cartCtx?.count || 0;
  const openDrawer = cartCtx?.openDrawer || (() => onNavigate('cart'));

  const handleOpenCart = () => {
    if (cartCtx && typeof cartCtx.openDrawer === 'function') {
      cartCtx.openDrawer();
    } else {
      onNavigate('cart');
    }
  };

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const storeMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Detect window scroll for dynamic topbar theme transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut (/ or Ctrl+K) to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (storeMenuRef.current && !storeMenuRef.current.contains(e.target)) {
        setIsStoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/animals?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.success && res.data) {
          setSuggestions(res.data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isHomeTransparent = currentPage === 'home' && !isScrolled;

  return (
    <header
      className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHomeTransparent
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white border-transparent'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* Dynamic Logo & Store Title */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0 group"
        >
          {config.app_logo_url ? (
            <img
              src={config.app_logo_url}
              alt={config.app_name}
              className="w-11 h-11 rounded-2xl object-cover shadow-sm border border-theme-border group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm ${
              isHomeTransparent
                ? 'bg-white/15 border border-white/30 backdrop-blur-md'
                : 'bg-theme-primary/10 border border-theme-primary/30'
            }`}>
              🐂
            </div>
          )}
          <div>
            <span className={`text-xl font-extrabold tracking-tight block leading-tight ${
              isHomeTransparent ? 'text-white' : 'text-theme-text'
            }`}>
              {config.app_name}
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase block ${
              isHomeTransparent ? 'text-emerald-300' : 'text-theme-primary'
            }`}>
              Marketplace Ternak Mandiri
            </span>
          </div>
        </div>

        {/* Mega Search Bar with Live Suggestions Dropdown */}
        <div className="flex-1 max-w-xl relative" ref={searchContainerRef}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari Sapi Limosin, Domba Garut, Kambing Etawa, SKKH..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  onNavigate('catalog');
                }
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  inputRef.current?.blur();
                }
              }}
              className={`w-full rounded-2xl pl-11 pr-20 py-2.5 text-xs focus:outline-none transition-all ${
                isHomeTransparent
                  ? 'bg-black/35 backdrop-blur-md border border-white/20 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-lg'
                  : 'bg-theme-bg/95 border border-theme-border text-theme-text placeholder:text-theme-muted focus:ring-2 focus:ring-theme-primary/30 focus:border-theme-primary shadow-inner'
              }`}
            />
            <Search className={`w-4 h-4 absolute left-4 top-3 ${
              isHomeTransparent ? 'text-white/80' : 'text-theme-muted'
            }`} />

            {/* Clear Button & Shortcut Badge */}
            <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    if (setSearchQuery) setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className={`p-1 rounded-full text-xs font-bold transition-colors ${
                    isHomeTransparent ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-theme-muted hover:text-theme-text hover:bg-theme-card'
                  }`}
                >
                  ✕
                </button>
              ) : (
                <kbd className={`hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded select-none ${
                  isHomeTransparent
                    ? 'bg-white/20 border border-white/30 text-white'
                    : 'bg-theme-card border border-theme-border/80 text-theme-muted'
                }`}>
                  /
                </kbd>
              )}

              {isSearching && (
                <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </div>
          </div>

          {/* Autocomplete & Quick Recommendation Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-theme-card border border-theme-border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Quick Tags / Recommended Keywords */}
              <div className="mb-2 pb-2 border-b border-theme-border/60">
                <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">
                  Kategori & Pencarian Populer:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🐂 Sapi Limosin', query: 'Limosin' },
                    { label: '🐑 Domba Garut', query: 'Domba Garut' },
                    { label: '🐐 Kambing Etawa', query: 'Etawa' },
                    { label: '✅ SKKH Resmi', query: 'SKKH' },
                    { label: '⭐ Siap Qurban', query: 'Qurban' }
                  ].map((tag) => (
                    <button
                      key={tag.query}
                      type="button"
                      onClick={() => {
                        if (setSearchQuery) setSearchQuery(tag.query);
                        onNavigate('catalog');
                        setShowSuggestions(false);
                      }}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-theme-bg hover:bg-theme-primary/10 hover:text-theme-primary border border-theme-border/70 text-theme-text transition-all"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions Results */}
              {searchQuery && searchQuery.trim().length >= 2 ? (
                suggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-theme-muted">
                    Tidak ada hewan ternak yang cocok dengan "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-theme-border/50 max-h-80 overflow-y-auto">
                    <div className="px-2 py-1 text-[11px] font-bold text-theme-muted flex items-center justify-between">
                      <span>Hasil Ternak Langsung ({suggestions.length})</span>
                      <span className="text-[10px] text-theme-primary font-semibold">Tekan Enter untuk katalog</span>
                    </div>

                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          if (onSelectAnimal) {
                            onSelectAnimal(item);
                          } else {
                            onNavigate('catalog');
                          }
                        }}
                        className="p-2.5 hover:bg-theme-bg rounded-xl cursor-pointer flex items-center gap-3 transition-colors group"
                      >
                        <img
                          src={item.images?.[0] || item.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-theme-border flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-theme-text truncate group-hover:text-theme-primary transition-colors">
                              {item.title}
                            </h4>
                            <span className="text-xs font-black text-theme-primary ml-2 flex-shrink-0">
                              {formatRupiah(item.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-theme-muted">
                            <span className="bg-theme-primary/10 text-theme-primary font-bold px-1.5 py-0.5 rounded text-[9px]">
                              {item.category}
                            </span>
                            <span>• {formatWeight(item.weight_kg)}</span>
                            {item.skkh_verification_status && (
                              <span className="text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px]">
                                SKKH Terverifikasi
                              </span>
                            )}
                            <span className="truncate">• {item.store?.store_name || item.store?.name || 'Peternak Barokah'}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSuggestions(false);
                          onNavigate('catalog');
                        }}
                        className="text-xs font-bold text-theme-primary hover:underline py-1 w-full text-center"
                      >
                        Lihat Semua Hasil di Katalog →
                      </button>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>

        {/* Action Links & Context Tools */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onNavigate('catalog')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentPage === 'catalog'
                ? 'bg-emerald-500 text-white shadow-sm'
                : isHomeTransparent
                ? 'text-white hover:bg-white/15'
                : 'text-theme-text hover:bg-theme-bg'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Katalog</span>
          </button>

          <button
            onClick={() => onNavigate(isAuthenticated ? 'orders' : 'auth')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentPage === 'orders'
                ? 'bg-emerald-500 text-white shadow-sm'
                : isHomeTransparent
                ? 'text-white hover:bg-white/15'
                : 'text-theme-text hover:bg-theme-bg'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Lacak Pesanan</span>
          </button>

          {/* Cart Button (Opens slide-out drawer) */}
          <button
            onClick={handleOpenCart}
            className={`relative p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
              isHomeTransparent
                ? 'bg-white/10 border-white/25 text-white hover:bg-white/20'
                : 'bg-theme-bg border border-theme-border text-theme-text hover:bg-theme-border/50'
            }`}
            title="Buka Keranjang Belanja"
          >
            <ShoppingBag className={`w-5 h-5 ${isHomeTransparent ? 'text-white' : 'text-theme-text'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-theme-card animate-scale">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notification Bell (If logged in) */}
          {isAuthenticated && <NotificationDropdown />}

          {/* SELLER / BUYER STORE DIFFERENTIATION */}
          {isAuthenticated ? (
            isSeller && user.store?.is_verified ? (
              /* Seller has active & verified store: "Toko Saya" Dropdown */
              <div className="relative" ref={storeMenuRef}>
                <button
                  onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>Kandang Saya</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isStoreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-theme-border rounded-2xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="px-3 py-2 border-b border-theme-border/60 mb-1">
                      <p className="font-extrabold text-theme-text truncate">{user.store?.store_name || 'Kandang Barokah'}</p>
                      <p className="text-[10px] text-theme-muted">Tier: {user.store?.tier || 'BRONZE'}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('seller-dashboard'); setIsStoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-theme-bg font-bold flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-theme-primary" /> Pesanan Masuk
                    </button>
                    <button
                      onClick={() => { onNavigate('manage-livestock'); setIsStoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-theme-bg font-bold flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" /> Tambah Ternak Baru
                    </button>
                  </div>
                )}
              </div>
            ) : (user.has_store || user.store) && !user.store?.is_verified ? (
              /* Registered store awaiting approval */
              <button
                onClick={() => onNavigate('register-store')}
                className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Toko sedang dalam proses verifikasi admin"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Verifikasi Toko</span>
              </button>
            ) : (
              /* Normal Buyer without store: "Buka Toko" Button */
              <button
                onClick={() => onNavigate('register-store')}
                className="px-3 py-2 rounded-xl bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-theme-text text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-theme-primary" />
                <span>Buka Toko</span>
              </button>
            )
          ) : null}

          {/* User Account / Auth Dropdown */}
          {isAuthenticated ? (
            <div className="relative pl-1 border-l border-theme-border" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors ${
                  isHomeTransparent ? 'text-white hover:bg-white/10' : 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-theme-border"
                />
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold leading-none">{user.name.split(' ')[0]}</div>
                  {user.role !== 'ADMIN' && user.badge ? (
                    <div className="mt-0.5">
                      <TierBadge badge={user.badge} size="xs" />
                    </div>
                  ) : null}
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs space-y-1">
                  {/* User Profile Header in Dropdown */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-extrabold text-slate-900 dark:text-white truncate">{user.name}</p>
                    {user.role !== 'ADMIN' && user.badge ? (
                      <div className="mt-1">
                        <TierBadge badge={user.badge} size="xs" />
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5 uppercase tracking-wider font-mono">
                        {user.role === 'ADMIN' ? 'Administrator' : user.role}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => { onNavigate('orders'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-2 transition"
                  >
                    <Package className="w-4 h-4 text-theme-primary" /> Pesanan Saya
                  </button>
                  <button
                    onClick={() => { onNavigate('chat'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-theme-primary" /> Chat / Negosiasi
                  </button>
                  <button
                    onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-2 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Profil & Alamat
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={() => { logout(); setIsUserMenuOpen(false); onNavigate('auth'); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 font-bold flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-sm transition-all"
            >
              <User className="w-4 h-4" />
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
