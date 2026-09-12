// AppConfigContext.jsx - Dynamic Branding & Platform Identity Manager
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AppConfigContext = createContext(null);

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState({
    app_name: 'Ternakmart',
    tagline: 'Platform E-Commerce Peternakan & Logistik Armada Mandiri Terpercaya',
    app_logo_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=128&auto=format&fit=crop&q=80',
    app_favicon_url: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/1f404.png',
    active_theme: 'emerald-agro',
    timezone_offset: 'Asia/Jakarta',
    timezone_label: 'WIB (UTC+7)',
    service_fee_nominal: 35000,
    support_whatsapp: '+6281234567890'
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setConfig(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('Using default app config fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update dynamic favicon in head
  useEffect(() => {
    if (config.app_favicon_url) {
      const faviconLink = document.getElementById('dynamic-favicon');
      if (faviconLink) {
        faviconLink.href = config.app_favicon_url;
      }
    }
  }, [config.app_favicon_url]);

  // Sync theme with ThemeContext when active_theme changes from server
  useEffect(() => {
    if (config.active_theme) {
      window.__setServerTheme(config.active_theme);
    }
  }, [config.active_theme]);

  // Helper to set page title dynamically: e.g. setDocumentTitle('Katalog Ternak') -> "Katalog Ternak | Ternakmart"
  const setDocumentTitle = (pageTitle) => {
    const titleEl = document.getElementById('dynamic-page-title');
    const fullTitle = pageTitle ? `${pageTitle} | ${config.app_name}` : `${config.app_name} | Platform E-Commerce Peternakan`;
    document.title = fullTitle;
    if (titleEl) {
      titleEl.innerText = fullTitle;
    }
  };

  const updatePlatformConfig = async (newConfigData) => {
    const res = await api.put('/settings', newConfigData);
    if (res.success) {
      setConfig(prev => ({ ...prev, ...res.data }));
    }
    return res;
  };

  return (
    <AppConfigContext.Provider value={{ config, loading, fetchConfig, setDocumentTitle, updatePlatformConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
