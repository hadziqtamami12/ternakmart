import React, { useState, useEffect } from 'react';
import { Home, Compass, ShoppingBag, MessageCircle, User, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function NavItem({ icon: Icon, label, isActive, onClick, badge, activeColor = 'primary' }) {
  const isAmber = activeColor === 'amber';
  
  // High-contrast vibrant styling dynamically adapted to the active marketplace theme
  const activeIconWrapper = isAmber
    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/30 -translate-y-1 scale-105'
    : 'bg-theme-primary text-theme-primary-contrast shadow-lg shadow-theme-primary/30 ring-2 ring-theme-primary/30 -translate-y-1 scale-105';
  
  const activeText = isAmber
    ? 'text-amber-600 dark:text-amber-400 font-black scale-105'
    : 'text-theme-primary font-black scale-105';
    
  const activePill = isAmber ? 'bg-amber-500' : 'bg-theme-primary';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 group focus:outline-none"
    >
      <div
        className={`relative p-2 rounded-2xl transition-all duration-300 ${
          isActive
            ? activeIconWrapper
            : 'text-theme-muted/70 hover:text-theme-text group-hover:bg-theme-bg/60'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-theme-card shadow-sm animate-in zoom-in">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
          isActive ? activeText : 'text-theme-muted/80 font-semibold'
        }`}
      >
        {label}
      </span>
      {isActive ? (
        <span className={`w-4 h-1 rounded-full ${activePill} mt-0.5 shadow-sm animate-in zoom-in duration-200`} />
      ) : (
        <span className="w-4 h-1 rounded-full bg-transparent mt-0.5" />
      )}
    </button>
  );
}

export default function FloatingBottomDock({ currentPage, onNavigate }) {
  const { isAuthenticated, isSeller, user } = useAuth();
  const cartCtx = useCart();
  const cartCount = cartCtx?.count || 0;

  // Always permanently visible at the very bottom of the mobile screen
  const isHomeActive = currentPage === 'home';
  const isCatalogActive = currentPage === 'catalog' || currentPage === 'animal-detail';
  const isCartActive = currentPage === 'cart' || currentPage === 'checkout';
  const isChatActive = currentPage === 'chat';
  const isSellerActive = currentPage === 'seller-dashboard' || currentPage === 'manage-livestock';
  const isProfileActive =
    currentPage === 'profile' ||
    currentPage === 'orders' ||
    currentPage === 'tracking' ||
    currentPage === 'auth' ||
    currentPage === 'register-store';

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[1100] border-t border-theme-border shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
      style={{
        backgroundColor: 'var(--color-card, #ffffff)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <nav
        className="px-2 py-1.5 flex items-center justify-around max-w-lg mx-auto"
        aria-label="Navigasi Utama Mobile"
      >
        {/* 1. Beranda */}
        <NavItem
          icon={Home}
          label="Beranda"
          isActive={isHomeActive}
          onClick={() => onNavigate('home')}
        />

        {/* 2. Kategori / Eksplor */}
        <NavItem
          icon={Compass}
          label="Kategori"
          isActive={isCatalogActive}
          onClick={() => onNavigate('catalog')}
        />

        {/* 3. Keranjang with Badge */}
        <NavItem
          icon={ShoppingBag}
          label="Keranjang"
          isActive={isCartActive}
          badge={cartCount}
          onClick={() => onNavigate('cart')}
        />

        {/* 4. Chat (Auth-Gated) */}
        <NavItem
          icon={MessageCircle}
          label="Chat"
          isActive={isChatActive}
          onClick={() => {
            if (!isAuthenticated) {
              onNavigate('auth', { redirect: 'chat' });
            } else {
              onNavigate('chat');
            }
          }}
        />

        {/* 5. Toko (Jika Mitra Peternak) atau Akun / Masuk */}
        {isAuthenticated && isSeller && user?.store?.is_verified ? (
          <NavItem
            icon={Store}
            label="Toko"
            isActive={isSellerActive}
            activeColor="amber"
            onClick={() => onNavigate('seller-dashboard')}
          />
        ) : (
          <NavItem
            icon={User}
            label={isAuthenticated ? 'Akun' : 'Masuk'}
            isActive={isProfileActive}
            onClick={() => onNavigate(isAuthenticated ? 'profile' : 'auth')}
          />
        )}
      </nav>
    </div>
  );
}

