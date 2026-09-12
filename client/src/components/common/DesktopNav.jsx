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
  Truck
} from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationDropdown from './NotificationDropdown';

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

  const storeMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);

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

  return (
    <header className="hidden lg:block sticky top-0 z-40 glass-nav border-b border-theme-border/80 transition-colors">
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
            <div className="w-11 h-11 rounded-2xl bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">
              🐂
            </div>
          )}
          <div>
            <span className="text-xl font-extrabold tracking-tight text-theme-text block leading-tight">
              {config.app_name}
            </span>
            <span className="text-[10px] font-bold tracking-wider text-theme-primary uppercase block">
              Marketplace Ternak Mandiri
            </span>
          </div>
        </div>

        {/* Mega Search Bar with Live Suggestions Dropdown */}
        <div className="flex-1 max-w-lg relative" ref={searchContainerRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Sapi Limosin, Domba Garut, Kambing Etawa, SKKH..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  onNavigate('catalog');
                }
              }}
              className="w-full bg-theme-bg/90 border border-theme-border rounded-2xl pl-11 pr-4 py-2.5 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30 focus:border-theme-primary transition-all"
            />
            <Search className="w-4 h-4 text-theme-muted absolute left-4 top-3" />
            {isSearching && (
              <div className="absolute right-4 top-3 w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-theme-card border border-theme-border rounded-2xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-theme-muted border-b border-theme-border flex items-center justify-between">
                <span>Hasil Pencarian Cepat</span>
                <span className="text-[10px] text-theme-primary font-semibold">Tekan Enter untuk katalog</span>
              </div>

              {suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-theme-muted">
                  Tidak ada hewan ternak yang cocok dengan "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-theme-border/50 max-h-80 overflow-y-auto">
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
                      className="p-2 hover:bg-theme-bg rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-theme-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-theme-text truncate">{item.title}</h4>
                          <span className="text-xs font-extrabold text-theme-primary ml-2 flex-shrink-0">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-theme-muted">
                          <span className="bg-theme-bg px-1.5 py-0.2 rounded border border-theme-border/60">
                            {item.category}
                          </span>
                          <span>• {formatWeight(item.weight_kg)}</span>
                          <span className="truncate">• {item.store?.name || 'Peternak Resmi'}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <button
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
              )}
            </div>
          )}
        </div>

        {/* Action Links & Context Tools */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onNavigate('catalog')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentPage === 'catalog'
                ? 'bg-theme-primary text-white shadow-sm'
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
                ? 'bg-theme-primary text-white shadow-sm'
                : 'text-theme-text hover:bg-theme-bg'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Lacak Pesanan</span>
          </button>

{/* Cart Button (Opens slide-out drawer) */}
          <button
            onClick={handleOpenCart}
            className="relative p-2.5 rounded-xl bg-theme-bg border border-theme-border text-theme-text hover:bg-theme-border/50 transition-colors flex items-center justify-center"
            title="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 text-theme-text" />
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
            isSeller ? (
              /* Seller has store: "Toko Saya" Dropdown */
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
                  <div className="absolute right-0 mt-2 w-52 bg-theme-card border border-theme-border rounded-2xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="px-3 py-2 border-b border-theme-border/60 mb-1">
                      <p className="font-extrabold text-theme-text truncate">{user.store?.store_name || 'Kandang Barokah'}</p>
                      <p className="text-[10px] text-theme-muted">Tier: {user.store?.tier || 'OFFICIAL'}</p>
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
            ) : (
              /* Normal Buyer: "Buka Toko Gratis" Button */
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-theme-bg transition-colors"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-theme-border"
                />
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold leading-none">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-theme-muted font-medium mt-0.5">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-2xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs space-y-1">
                  <button
                    onClick={() => { onNavigate('orders'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-theme-bg font-bold flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-theme-primary" /> Pesanan Saya
                  </button>
                  <button
                    onClick={() => { onNavigate('chat'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-theme-bg font-bold flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-theme-primary" /> Chat / Negosiasi
                  </button>
                  <button
                    onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-theme-bg font-bold flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-theme-muted" /> Profil & Alamat
                  </button>
                  <div className="border-t border-theme-border/60 my-1"></div>
                  <button
                    onClick={() => { logout(); setIsUserMenuOpen(false); onNavigate('auth'); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 font-bold flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
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
