import React, { useState, useEffect } from 'react';
import { Home, Compass, ShoppingBag, MessageCircle, User, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function NavItem({ icon: Icon, label, isActive, onClick, badge, activeColor = 'primary' }) {
  const isAmber = activeColor === 'amber';
  
  // High-contrast vibrant styling dynamically adapted to the active marketplace theme
  const activeIconWrapper = isAmber
    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 ring-4 ring-theme-card -translate-y-2.5 scale-105 rounded-full'
    : 'bg-theme-primary text-theme-primary-contrast shadow-lg shadow-theme-primary/40 ring-4 ring-theme-card -translate-y-2.5 scale-105 rounded-full';
  
  const activeText = isAmber
    ? 'text-amber-600 dark:text-amber-400 font-black'
    : 'text-theme-primary font-black';
    
  const activePill = isAmber ? 'bg-amber-500' : 'bg-theme-primary';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center flex-1 pt-1.5 pb-1 transition-all duration-200 group focus:outline-none"
    >
      {/* Efek lengkungan halus ke atas untuk tab aktif */}
      {isActive && (
        <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 pointer-events-none z-0">
          <svg
            viewBox="0 0 68 16"
            className="w-[68px] h-[16px] overflow-visible drop-shadow-[0_-3px_5px_rgba(0,0,0,0.06)]"
          >
            <path
              d="M 0 14 C 13 14, 17 2, 34 2 C 51 2, 55 14, 68 14 L 68 16 L 0 16 Z"
              style={{ fill: 'var(--color-card, #ffffff)' }}
            />
            <path
              d="M 0 14 C 13 14, 17 2, 34 2 C 51 2, 55 14, 68 14"
              fill="none"
              stroke="currentColor"
              style={{ stroke: 'var(--color-border, #e5e7eb)' }}
              strokeWidth="1.2"
            />
          </svg>
        </div>
      )}

      <div
        className={`relative z-10 p-2 rounded-2xl transition-all duration-300 ${
          isActive
            ? activeIconWrapper
            : 'text-theme-muted/70 hover:text-theme-text group-hover:bg-theme-bg/60'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-theme-card shadow-sm animate-in zoom-in z-20">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 relative z-10 ${
          isActive ? activeText : 'text-theme-muted/80 font-semibold'
        }`}
      >
        {label}
      </span>
      {isActive ? (
        <span className={`w-3.5 h-1 rounded-full ${activePill} mt-0.5 shadow-sm animate-in zoom-in duration-200 relative z-10`} />
      ) : (
        <span className="w-3.5 h-1 rounded-full bg-transparent mt-0.5" />
      )}
    </button>
  );
}

export default function FloatingBottomDock({ currentPage, onNavigate }) {
  const { isAuthenticated, isSeller, user } = useAuth();
  const cartCtx = useCart();
  const cartCount = cartCtx?.count || 0;

  // Di halaman beranda, bottom nav disembunyikan saat di posisi paling atas dan muncul ketika pengguna mulai scroll ke bawah.
  // Di halaman lainnya (katalog, keranjang, chat, profil, dll.), bottom nav selalu tampil.
  const [isVisible, setIsVisible] = useState(currentPage !== 'home');

  useEffect(() => {
    if (currentPage !== 'home') {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      setIsVisible(scrollPos > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Map subpages to their parent bottom navigation tab
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
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[1100] border-t border-theme-border shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'var(--color-card, #ffffff)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <nav
        className="px-2 flex items-center justify-around max-w-lg mx-auto relative overflow-visible"
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

