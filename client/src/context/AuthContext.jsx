// AuthContext.jsx - User Authentication & Session Management (Isolated Admin & Customer Sessions)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ── Customer / Marketplace Session ──────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('ternakmart_token') : null;
    return (t && t !== 'null' && t !== 'undefined') ? t : null;
  });
  const [loading, setLoading] = useState(true);

  // ── Admin Session (Strictly isolated to /admin) ──────────────────────
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('ternakmart_admin_token') : null;
    return (t && t !== 'null' && t !== 'undefined') ? t : null;
  });
  const [adminLoading, setAdminLoading] = useState(true);

  // Validate Customer User Session
  const fetchCustomerUser = async () => {
    const currentToken = localStorage.getItem('ternakmart_token');
    if (!currentToken || currentToken === 'null' || currentToken === 'undefined') {
      localStorage.removeItem('ternakmart_token');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.success && res.data) {
        // Admin credentials should never occupy marketplace customer session
        if (res.data.role === 'ADMIN') {
          localStorage.removeItem('ternakmart_token');
          setUser(null);
        } else {
          setUser(res.data);
        }
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Validate Admin User Session
  const fetchAdminUser = async () => {
    const currentAdminToken = localStorage.getItem('ternakmart_admin_token');
    if (!currentAdminToken || currentAdminToken === 'null' || currentAdminToken === 'undefined') {
      localStorage.removeItem('ternakmart_admin_token');
      setAdminUser(null);
      setAdminLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me', {
        headers: { 'Authorization': `Bearer ${currentAdminToken}` }
      });
      if (res.success && res.data && res.data.role === 'ADMIN') {
        setAdminUser(res.data);
      } else {
        adminLogout();
      }
    } catch (err) {
      adminLogout();
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerUser();
  }, [token]);

  useEffect(() => {
    fetchAdminUser();
  }, [adminToken]);

  // ── Customer Auth Actions ──────────────────────────────────────────
  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.success && res.data) {
      // If an admin logs in on the regular customer portal, prevent taking over customer session
      if (res.data.user.role === 'ADMIN') {
        throw new Error('Akun Administrator tidak dapat masuk melalui portal belanja pelanggan. Silakan gunakan tautan /admin.');
      }
      localStorage.setItem('ternakmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      localStorage.setItem('ternakmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('ternakmart_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.success && res.data) {
      setUser(prev => ({ ...prev, ...res.data }));
    }
    return res;
  };

  // ── Admin Auth Actions ─────────────────────────────────────────────
  const adminLogin = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      identifier,
      password,
      portal: 'admin'
    }, {
      headers: { 'X-Auth-Portal': 'admin' }
    });

    if (res.success && res.data) {
      if (res.data.user.role !== 'ADMIN') {
        throw new Error(`Akses ditolak. Akun '${res.data.user.username}' (${res.data.user.role}) bukan administrator. Halaman login ini khusus untuk Super Admin.`);
      }
      localStorage.setItem('ternakmart_admin_token', res.data.token);
      setAdminToken(res.data.token);
      setAdminUser(res.data.user);
    }
    return res;
  };

  const adminLogout = () => {
    localStorage.removeItem('ternakmart_admin_token');
    setAdminToken(null);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        // Marketplace Customer Session
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && user.role !== 'ADMIN'),
        isSeller: user?.role === 'SELLER',
        isCourier: user?.role === 'COURIER',
        isBuyer: user?.role === 'BUYER',
        login,
        register,
        logout,
        refreshUser: fetchCustomerUser,
        updateProfile,

        // Admin Session (Strictly isolated to /admin)
        adminUser,
        adminToken,
        adminLoading,
        isAdminAuthenticated: Boolean(adminUser && adminUser.role === 'ADMIN'),
        isAdmin: Boolean(adminUser && adminUser.role === 'ADMIN'),
        adminLogin,
        adminLogout,
        refreshAdminUser: fetchAdminUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return ctx || {
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    isSeller: false,
    isCourier: false,
    isBuyer: false,
    adminUser: null,
    adminToken: null,
    adminLoading: false,
    isAdminAuthenticated: false,
    isAdmin: false
  };
};
