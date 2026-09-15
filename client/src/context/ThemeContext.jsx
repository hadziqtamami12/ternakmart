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

export function normalizeThemeId(themeId) {
  if (!themeId) return 'meadow-emerald';
  if (themeId === 'emerald-agro') return 'meadow-emerald';
  const found = THEMES.find(t => t.id === themeId);
  return found ? found.id : 'meadow-emerald';
}

export function ThemeProvider({ children }) {
  const [marketplaceTheme, setMarketplaceTheme] = useState(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('ternakmart_theme') : null;
    return normalizeThemeId(stored || 'meadow-emerald');
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [serverTheme, setServerThemeState] = useState(null);
  const initializedRef = useRef(false);

  // Apply theme to document (both landing page and admin share the theme)
  const applyTheme = useCallback((theme, saveStorage = true) => {
    const normalized = normalizeThemeId(theme);
    document.documentElement.setAttribute('data-theme', normalized);
    const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('theme_preview');
    if (saveStorage && !isPreview && typeof localStorage !== 'undefined') {
      localStorage.setItem('ternakmart_theme', normalized);
    }
  }, []);

  // Sync with server theme when available (skip if inside preview mode)
  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('theme_preview');
    if (isPreview) return;

    if (serverTheme) {
      const normServer = normalizeThemeId(serverTheme);
      if (normServer !== marketplaceTheme) {
        setMarketplaceTheme(normServer);
        applyTheme(normServer, true);
      }
    }
  }, [serverTheme, marketplaceTheme, applyTheme]);

  // Initial load from URL preview or localStorage (fallback) and apply
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const previewParam = params?.get('theme_preview');

      if (previewParam) {
        const normPreview = normalizeThemeId(previewParam);
        setMarketplaceTheme(normPreview);
        document.documentElement.setAttribute('data-theme', normPreview);
      } else {
        const stored = localStorage.getItem('ternakmart_theme');
        const initialTheme = normalizeThemeId(stored || 'meadow-emerald');
        setMarketplaceTheme(initialTheme);
        applyTheme(initialTheme, true);
      }
    }
  }, [applyTheme]);

  // Listen for live postMessage theme change events (from parent admin preview)
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SET_THEME_PREVIEW') {
        const nextTheme = normalizeThemeId(e.data.theme);
        setMarketplaceTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Override global setter with actual implementation
  useEffect(() => {
    window.__themeContextSetServerTheme = (theme) => {
      if (theme) {
        setServerThemeState(normalizeThemeId(theme));
      }
    };
    return () => {
      window.__themeContextSetServerTheme = () => {};
    };
  }, []);

  const switchTheme = useCallback((newTheme) => {
    const valid = normalizeThemeId(newTheme);
    setMarketplaceTheme(valid);
    applyTheme(valid, true);
  }, [applyTheme]);

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
