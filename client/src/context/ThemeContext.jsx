// ThemeContext.jsx - Dynamic Multi-Theme Engine synced with server-side settings
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'emerald-agro',        name: 'Emerald Agro',        desc: 'Hijau segar natural (Default)',          color: '#059669', bg: '#f8fafc', preview: ['#f8fafc', '#059669', '#f59e0b'] },
  { id: 'charcoal-midnight',   name: 'Charcoal Midnight',   desc: 'Dark mode kontras tinggi slate-zinc',    color: '#10b981', bg: '#090d16', preview: ['#090d16', '#10b981', '#fbbf24'] },
  { id: 'warm-earth',          name: 'Warm Earth',          desc: 'Terracotta amber pedesaan premium',      color: '#c2410c', bg: '#faf7f2', preview: ['#faf7f2', '#c2410c', '#d97706'] },
  { id: 'ocean-blue',          name: 'Ocean Blue',          desc: 'Biru profesional modern',                color: '#2563eb', bg: '#f0f4ff', preview: ['#f0f4ff', '#2563eb', '#7c3aed'] },
  { id: 'rose-pink',           name: 'Rose Pink',           desc: 'Merah muda elegan cerah',                color: '#e11d48', bg: '#fff1f2', preview: ['#fff1f2', '#e11d48', '#f97316'] },
  { id: 'purple-royal',        name: 'Purple Royal',        desc: 'Ungu kerajaan mewah premium',            color: '#7c3aed', bg: '#faf5ff', preview: ['#faf5ff', '#7c3aed', '#ec4899'] },
];

// Register global setter immediately (synchronously) to avoid race conditions
window.__setServerTheme = (theme) => {
  // This will be overwritten by ThemeProvider on mount
  if (window.__themeContextSetServerTheme) {
    window.__themeContextSetServerTheme(theme);
  }
};

export function ThemeProvider({ children }) {
  const [marketplaceTheme, setMarketplaceTheme] = useState('emerald-agro');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [serverTheme, setServerThemeState] = useState(null);
  const initializedRef = useRef(false);

  // Apply theme to document
  const applyTheme = useCallback((theme, adminMode) => {
    if (adminMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('ternakmart_theme', theme);
  }, []);

  // Sync with server theme when available
  useEffect(() => {
    if (serverTheme && serverTheme !== marketplaceTheme) {
      setMarketplaceTheme(serverTheme);
      applyTheme(serverTheme, isAdminMode);
    }
  }, [serverTheme, isAdminMode, applyTheme]);

  // Initial load from localStorage (fallback) and apply
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const stored = localStorage.getItem('ternakmart_theme');
      const initialTheme = stored || 'emerald-agro';
      setMarketplaceTheme(initialTheme);
      applyTheme(initialTheme, isAdminMode);
    }
  }, [isAdminMode, applyTheme]);

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
