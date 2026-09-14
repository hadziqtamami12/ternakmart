// ThemeContext.jsx - Dynamic Multi-Theme Engine synced with server-side settings
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'meadow-emerald',    name: 'Meadow Emerald',    desc: 'Hijau agrikultur subur & asri (Default)', primary: '#15803D', accent: '#86EFAC', surface: '#F0FDF4', color: '#15803D', bg: '#F0FDF4', preview: ['#F0FDF4', '#15803D', '#86EFAC'] },
  { id: 'sunset-terracotta', name: 'Sunset Terracotta', desc: 'Nuansa tanah & peternakan hangat',       primary: '#C2410C', accent: '#FDBA74', surface: '#FFF7ED', color: '#C2410C', bg: '#FFF7ED', preview: ['#FFF7ED', '#C2410C', '#FDBA74'] },
  { id: 'slate-agrotech',    name: 'Slate Agrotech',    desc: 'Modern dark industrial tech',            primary: '#38BDF8', accent: '#38BDF8', surface: '#0F172A', color: '#38BDF8', bg: '#0F172A', preview: ['#0F172A', '#38BDF8', '#38BDF8'] },
  { id: 'pasture-azure',     name: 'Pasture Azure',     desc: 'Biru maritim/agribisnis profesional',     primary: '#0369A1', accent: '#7DD3FC', surface: '#F0F9FF', color: '#0369A1', bg: '#F0F9FF', preview: ['#F0F9FF', '#0369A1', '#7DD3FC'] },
];

// Register global setter immediately (synchronously) to avoid race conditions
window.__setServerTheme = (theme) => {
  // This will be overwritten by ThemeProvider on mount
  if (window.__themeContextSetServerTheme) {
    window.__themeContextSetServerTheme(theme);
  }
};

export function ThemeProvider({ children }) {
  const [marketplaceTheme, setMarketplaceTheme] = useState('meadow-emerald');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [serverTheme, setServerThemeState] = useState(null);
  const initializedRef = useRef(false);

  // Apply theme to document (both landing page and admin share the theme)
  const applyTheme = useCallback((theme, saveStorage = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('theme_preview');
    if (saveStorage && !isPreview) {
      localStorage.setItem('ternakmart_theme', theme);
    }
  }, []);

  // Sync with server theme when available (skip if inside preview mode)
  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('theme_preview');
    if (isPreview) return;

    if (serverTheme && serverTheme !== marketplaceTheme) {
      setMarketplaceTheme(serverTheme);
      applyTheme(serverTheme);
    }
  }, [serverTheme, marketplaceTheme, applyTheme]);

  // Initial load from URL preview or localStorage (fallback) and apply
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const previewParam = params?.get('theme_preview');

      if (previewParam && THEMES.some(t => t.id === previewParam)) {
        setMarketplaceTheme(previewParam);
        document.documentElement.setAttribute('data-theme', previewParam);
      } else {
        const stored = localStorage.getItem('ternakmart_theme');
        const initialTheme = stored || 'meadow-emerald';
        setMarketplaceTheme(initialTheme);
        applyTheme(initialTheme);
      }
    }
  }, [applyTheme]);

  // Listen for live postMessage theme change events (from parent admin preview)
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SET_THEME_PREVIEW') {
        const nextTheme = e.data.theme;
        if (THEMES.some(t => t.id === nextTheme)) {
          setMarketplaceTheme(nextTheme);
          document.documentElement.setAttribute('data-theme', nextTheme);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Override global setter with actual implementation
  useEffect(() => {
    window.__themeContextSetServerTheme = (theme) => {
      setServerThemeState(theme);
    };
    return () => {
      window.__themeContextSetServerTheme = () => {};
    };
  }, []);

  const switchTheme = useCallback((newTheme) => {
    if (THEMES.some(t => t.id === newTheme)) {
      setMarketplaceTheme(newTheme);
      applyTheme(newTheme, isAdminMode);
    }
  }, [isAdminMode, applyTheme]);

  const enterAdminMode = useCallback(() => {
    setIsAdminMode(true);
    applyTheme(marketplaceTheme, true);
  }, [marketplaceTheme, applyTheme]);

  const exitAdminMode = useCallback(() => {
    setIsAdminMode(false);
    applyTheme(marketplaceTheme, false);
  }, [marketplaceTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{
      theme: marketplaceTheme,
      isAdminMode,
      switchTheme,
      enterAdminMode,
      exitAdminMode,
      availableThemes: THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
