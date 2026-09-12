// Footer.jsx - Clean, Balanced Livestock Marketplace Footer
import React from 'react';
import { ShieldCheck, Truck, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { useAuth } from '../../context/AuthContext';

export default function Footer({ onNavigate }) {
  const { config } = useAppConfig();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-theme-card border-t border-theme-border mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {config.app_logo_url ? (
                <img
                  src={config.app_logo_url}
                  alt={config.app_name}
                  className="w-8 h-8 rounded-xl object-cover border border-theme-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-lg">
                  🐂
                </div>
              )}
              <span className="font-extrabold text-base text-theme-text">
                {config.app_name}
              </span>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              {config.footer_text || 'Platform resmi transaksi hewan ternak bersertifikat SKKH & live armada terpadu.'}
            </p>
            <div className="space-y-1 text-xs text-theme-muted pt-1">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-theme-primary" />
                <span>CS WA: <strong className="text-theme-text">{config.support_whatsapp || '0812-3456-7890'}</strong></span>
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {config.sosmed_instagram && (
                <a href={config.sosmed_instagram} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-theme-bg border border-theme-border text-theme-muted hover:text-pink-500 hover:border-pink-500/50 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {config.sosmed_facebook && (
                <a href={config.sosmed_facebook} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-theme-bg border border-theme-border text-theme-muted hover:text-blue-500 hover:border-blue-500/50 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.sosmed_youtube && (
                <a href={config.sosmed_youtube} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-theme-bg border border-theme-border text-theme-muted hover:text-red-500 hover:border-red-500/50 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Kategori Ternak */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
              Kategori Hewan Ternak
            </h4>
            <ul className="space-y-2 text-xs text-theme-muted">
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'SAPI' })} className="hover:text-theme-primary transition-colors flex items-center gap-1.5">
                  <span>🐂</span> Sapi Qurban & Perah
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'DOMBA' })} className="hover:text-theme-primary transition-colors flex items-center gap-1.5">
                  <span>🐑</span> Domba Garut & Texel
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'KAMBING' })} className="hover:text-theme-primary transition-colors flex items-center gap-1.5">
                  <span>🐐</span> Kambing Etawa & Boer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog', { category: 'HEMAT' })} className="text-red-500 font-bold hover:underline flex items-center gap-1.5">
                  <span>🔥</span> Promo Flash Sale Ternak
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan & Informasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
              Layanan & Bantuan
            </h4>
            <ul className="space-y-2 text-xs text-theme-muted">
              {/* Only show Buka Toko if authenticated */}
              {isAuthenticated && (
                <li>
                  <button onClick={() => onNavigate('register-store')} className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1.5">
                    <span>🏡</span> Buka Toko Peternak
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate(isAuthenticated ? 'orders' : 'auth')} className="hover:text-theme-primary transition-colors flex items-center gap-1.5">
                  <span>🚚</span> Lacak Pengiriman Ternak
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('chat')} className="hover:text-theme-primary transition-colors flex items-center gap-1.5">
                  <span>💬</span> Negosiasi & Chat Peternak
                </button>
              </li>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }} className="hover:text-theme-text transition-colors">
                  Portal Super Admin (/admin)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Pembayaran */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
              Pembayaran & Standar SKKH
            </h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Metode pembayaran resmi transfer rekening bank & QRIS terenkripsi:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-[11px] font-bold">BCA</span>
              <span className="px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-[11px] font-bold">Mandiri</span>
              <span className="px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-[11px] font-bold">BRI</span>
              <span className="px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-[11px] font-bold">QRIS</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Garansi 100% Bobot Pas & Bebas PMK</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="border-t border-theme-border/60 mt-8 pt-4 pb-20 sm:pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-theme-muted">
          <span>© 2026 {config.app_name}. Seluruh Hak Cipta Dilindungi.</span>
          <span className="font-semibold">Platform E-Commerce Peternakan Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
