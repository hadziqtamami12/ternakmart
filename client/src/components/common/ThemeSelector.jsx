// ThemeSelector.jsx - Quick Theme Switcher Pill
import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, switchTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ganti Tema Tampilan"
        className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-text hover:bg-theme-border/50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
      >
        <Palette className="w-4 h-4 text-theme-primary" />
        <span className="hidden md:inline">Tema</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-theme-card border border-theme-border rounded-2xl shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-theme-border/60 mb-1">
            <p className="text-xs font-bold uppercase tracking-wider text-theme-muted">Pilih Tema Tampilan</p>
          </div>
          <div className="space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  switchTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                  theme === t.id
                    ? 'bg-theme-primary-light text-theme-primary font-semibold'
                    : 'text-theme-text hover:bg-theme-bg'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: t.color }} />
                  <div>
                    <div className="text-xs font-bold leading-tight">{t.name}</div>
                    <div className="text-[10px] text-theme-muted">{t.desc}</div>
                  </div>
                </div>
                {theme === t.id && <Check className="w-4 h-4 text-theme-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
