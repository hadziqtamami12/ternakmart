import React from 'react';
import { Home, Compass, MessageCircle, Package, User, Store, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FloatingBottomDock({ currentPage, onNavigate, activeOrdersCount = 1 }) {
  const { isAuthenticated, isSeller } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1100] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <nav
        className="px-4 py-1.5 flex items-center justify-between max-w-lg mx-auto"
        aria-label="Navigasi Utama Mobile"
      >
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
            currentPage === 'home' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          <Home className={`w-5 h-5 ${currentPage === 'home' ? 'scale-110 text-theme-primary' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Beranda</span>
        </button>

        {/* 2. Katalog */}
        <button
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
            currentPage === 'catalog' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-text'
          }`}
        >
          <Compass className={`w-5 h-5 ${currentPage === 'catalog' ? 'scale-110 text-theme-primary' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Katalog</span>
        </button>

        {/* 3. Elevated Center Action Button (Chat / Tawar Instan) */}
        <div className="relative -mt-5 flex flex-col items-center">
          <button
            onClick={() => onNavigate('chat')}
            aria-label="Chat dan Tawar Ternak Instan"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
          <span className="text-[9px] font-bold text-theme-primary mt-0.5 tracking-tight">
            Tawar
          </span>
        </div>

        {/* 4. Promo (if not logged in) or Pesanan (if logged in) */}
        {!isAuthenticated ? (
          <button
            onClick={() => onNavigate('catalog', { category: 'HEMAT' })}
            className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
              currentPage === 'catalog' ? 'text-amber-500 font-bold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] mt-1 font-medium text-amber-600 dark:text-amber-400">Promo</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('orders')}
            className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
              currentPage === 'orders' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <div className="relative">
              <Package className={`w-5 h-5 ${currentPage === 'orders' ? 'scale-110 text-theme-primary' : ''}`} />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-theme-card">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Pesanan</span>
          </button>
        )}

        {/* 5. Akun / Toko Saya (Seller Differentiation) */}
        {isAuthenticated && isSeller ? (
          <button
            onClick={() => onNavigate('seller-dashboard')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
              currentPage === 'seller-dashboard' ? 'text-amber-500 font-bold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Store className={`w-5 h-5 ${currentPage === 'seller-dashboard' ? 'scale-110 text-amber-500' : ''}`} />
            <span className="text-[10px] mt-1 font-medium text-amber-600 dark:text-amber-400">Toko</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate(isAuthenticated ? 'profile' : 'auth')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all ${
              currentPage === 'profile' || currentPage === 'auth' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <User className={`w-5 h-5 ${currentPage === 'profile' ? 'scale-110 text-theme-primary' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{isAuthenticated ? 'Akun' : 'Masuk'}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
